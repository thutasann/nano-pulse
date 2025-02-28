import { WebhookRepository } from '../../../api/repositories/webhooks.repository';
import { constants } from '../../../shared/constants';
import { kafka_produce } from '../../../shared/libraries/kafka/kafka-producer.service';
import { logger } from '../../../shared/libraries/utils/logger';
import { redis } from '../../connections/redis-connection';
import { WebhookEventSchema } from '../../zod-schemas/webhooks/webhooks.schema';

export class WebhookInitializer {
  private static instance: WebhookInitializer;
  private readonly WEBHOOK_QUEUE = constants.webhook.webhookQueue;
  private readonly WEBHOOK_PROCESSING_SET = constants.webhook.webhookProcessingSet;

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
   * Webhook Initialize
   * - Initialize Redis pub/sub for webhook events
   * - Initialize Kafka consumer for webhook processing
   * - Start the webhook delivery worker
   */
  async initialize() {
    try {
      //? Initialize Redis pub/sub for webhook events
      await this.initializeEventBus();

      //? Initialize Kafka consumer for webhook processing
      await this.initializeEventProcessor();

      //? Start the webhook delivery worker
      await this.startDeliveryWorker();

      logger.success(`Webhook System Initialized successfully 🚀`);
    } catch (error) {
      logger.error(`Webhook System Initialization Failed : ${error}`);
      throw error;
    }
  }

  /**
   * Initialize Event Bus
   */
  private async initializeEventBus() {
    redis.on('message', async (channel, message) => {
      if (channel == this.WEBHOOK_QUEUE) {
        try {
          const event = WebhookEventSchema.parse(JSON.parse(message));
          await kafka_produce(constants.kafka.topic, JSON.stringify(event));
        } catch (error) {
          logger.error(`Failed to process webhook event : ${error}`);
        }
      }
    });

    await redis.subscribe(this.WEBHOOK_QUEUE);
    logger.info(`Webhook Event Bus Initialized`);
  }

  /**
   * Initialise Kafka Consumer for processing webhook events
   */
  private async initializeEventProcessor() {
    await this.setupKafkaConsumer();
    logger.info(`Webhook event processor initialized`);
  }

  /**
   * Setup Kafka Consumer
   * @todo: this will be implemented in the next step
   * @todo: it wil handle the actual webhoook delivery logic
   */
  private async setupKafkaConsumer() {}

  /**
   * Start Delivery Worker that runs every minute
   */
  private async startDeliveryWorker() {
    setInterval(async () => {
      try {
        const failedDeliveries = await WebhookRepository.findFailedDeliveries();

        for (const delivery of failedDeliveries) {
          const subscription = await WebhookRepository.findSubscriptionById(delivery.webhookId);
          if (subscription && subscription.isActive) {
            // Re-queue for processing
            await kafka_produce(constants.kafka.webhookRetry, JSON.stringify(delivery));
          }
        }
      } catch (error) {
        logger.error(`Webhook delivery worker error: ${error}`);
      }
    }, 60000);
  }
}
