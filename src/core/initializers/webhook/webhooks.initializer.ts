import { Consumer } from 'kafkajs';
import { WebhookDeliveryRepository } from '../../../api/repositories/webhooks-delivery.repository';
import { WebhookSubscriptionRepository } from '../../../api/repositories/webhooks-subscription.repository';
import { constants } from '../../../shared/constants';
import { kafka_produce } from '../../../shared/libraries/kafka/kafka-producer.service';
import { logger } from '../../../shared/libraries/utils/logger';
import kafka from '../../connections/kafka-connection';
import { redis } from '../../connections/redis-connection';
import { WebhookEventSchema } from '../../zod-schemas/webhooks/webhooks.schema';

/**
 * Webhook Initializer
 * @description Initialize the webhook system
 * - Only essential event bus is initialized immediately
 * - Consumer initialization is delayed
 * - Retry worker starts after consumer is ready
 * - Webhook delivery worker starts after consumer is ready
 * - Webhook subscription worker starts after consumer is ready
 * - Webhook event processor starts after consumer is ready
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export class WebhookInitializer {
  private static instance: WebhookInitializer;
  private readonly WEBHOOK_QUEUE = constants.webhook.webhookQueue;
  private consumer: Consumer | null = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get Webhook Instance
   */
  static getInstance(): WebhookInitializer {
    if (!WebhookInitializer.instance) {
      WebhookInitializer.instance = new WebhookInitializer();
    }
    return WebhookInitializer.instance;
  }

  /**
   * Initialize only essential components
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.initializeEventBus();

      setTimeout(() => {
        this.initializeConsumer().catch((error) => {
          logger.error(`Failed to initialize consumer: ${error}`);
        });
      }, 5000);

      this.isInitialized = true;
      logger.success(`Webhook System Essential Services Initialized`);
    } catch (error) {
      logger.error(`Webhook System Initialization Failed: ${error}`);
      throw error;
    }
  }

  /**
   * Initialize Event Bus - Essential for receiving webhook events
   */
  private async initializeEventBus() {
    redis.on('message', async (channel, message) => {
      if (channel === this.WEBHOOK_QUEUE) {
        try {
          const event = WebhookEventSchema.parse(JSON.parse(message));
          await kafka_produce(constants.kafka.topic, JSON.stringify(event));
        } catch (error) {
          logger.error(`[Initialize Event Bus] Failed to process webhook event: ${error}`);
        }
      }
    });

    await redis.subscribe(this.WEBHOOK_QUEUE);
  }

  /**
   * Lazy load consumer initialization
   */
  private async initializeConsumer() {
    if (this.consumer) {
      return;
    }

    try {
      this.consumer = kafka.consumer({
        groupId: constants.kafka.groupId || 'webhook-group',
        maxWaitTimeInMs: 500,
      });

      await this.consumer.connect();
      await this.consumer.subscribe({
        topics: [constants.kafka.topic], // Subscribe only to main topic initially
        fromBeginning: false,
      });

      await this.setupConsumer();

      // Start retry worker after consumer is ready
      this.startRetryWorker();

      logger.success('Webhook consumer initialized');
    } catch (error) {
      logger.error(`Failed to initialize consumer: ${error}`);
      this.consumer = null;
    }
  }

  /**
   * Setup minimal consumer configuration
   */
  private async setupConsumer() {
    if (!this.consumer) return;

    await this.consumer.run({
      autoCommit: true,
      eachMessage: async ({ topic, message }) => {
        try {
          if (!message.value) return;
          const event = JSON.parse(message.value.toString());

          // Only log essential information
          logger.info(`Processing webhook event: ${event.id}`);

          // Add your webhook processing logic here
        } catch (error) {
          logger.error(`Error processing message: ${error}`);
        }
      },
    });
  }

  /**
   * Start retry worker - non-blocking
   */
  private startRetryWorker() {
    setInterval(async () => {
      try {
        const failedDeliveries = await WebhookDeliveryRepository.findFailedDeliveries();
        if (failedDeliveries.length === 0) return;

        // Batch process failed deliveries
        const retryDeliveries = await Promise.all(
          failedDeliveries.map(async (delivery) => {
            const subscription = await WebhookSubscriptionRepository.findSubscriptionById(delivery.webhookId);
            return subscription?.isActive ? delivery : null;
          })
        );

        const validDeliveries = retryDeliveries.filter(Boolean);
        if (validDeliveries.length > 0) {
          await kafka_produce(constants.kafka.webhookRetry, JSON.stringify(validDeliveries));
        }
      } catch (error) {
        logger.error(`Retry worker error: ${error}`);
      }
    }, 60000);
  }

  async shutdown() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
    this.isInitialized = false;
  }
}
