import { Consumer } from 'kafkajs';
import { WebhookDeliveryRepository } from '../../../api/repositories/webhooks-delivery.repository';
import { WebhookSubscriptionRepository } from '../../../api/repositories/webhooks-subscription.repository';
import { constants } from '../../../shared/constants';
import { kafka_produce } from '../../../shared/libraries/kafka/kafka-producer.service';
import { logger } from '../../../shared/libraries/utils/logger';
import kafka, { verifyConnection } from '../../connections/kafka-connection';
import { redis } from '../../connections/redis-connection';
import { WebhookEventSchema } from '../../zod-schemas/webhooks/webhooks.schema';

export class WebhookInitializer {
  private static instance: WebhookInitializer;
  private readonly WEBHOOK_QUEUE = constants.webhook.webhookQueue;
  private readonly WEBHOOK_PROCESSING_SET = constants.webhook.webhookProcessingSet;
  private consumer: Consumer;

  private constructor() {
    this.consumer = kafka.consumer({
      groupId: constants.kafka.groupId || 'webhook-group',
      maxWaitTimeInMs: 50,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

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
      logger.error(`Webhook System Initialization Failed: ${error}`);
      throw error;
    }
  }

  /**
   * Initialize Event Bus
   */
  private async initializeEventBus() {
    redis.on('message', async (channel, message) => {
      if (channel === this.WEBHOOK_QUEUE) {
        try {
          const event = WebhookEventSchema.parse(JSON.parse(message));
          await kafka_produce(constants.kafka.topic, JSON.stringify(event));
          logger.info(`Event published to Kafka: ${event.id}`);
        } catch (error) {
          logger.error(`Failed to process webhook event: ${error}`);
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
    try {
      const isConnected = await verifyConnection();
      if (!isConnected) {
        throw new Error('Failed to verify Kafka connection');
      }

      this.consumer = kafka.consumer({
        groupId: constants.kafka.groupId || 'webhook-group',
        maxWaitTimeInMs: 500,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        retry: {
          initialRetryTime: 300,
          retries: 10,
          maxRetryTime: 30000,
          factor: 1.5,
        },
      });

      await this.consumer.connect();

      await this.consumer.subscribe({
        topics: [
          constants.kafka.topic,
          constants.kafka.webhookRetry,
          constants.kafka.mediumPriorityTopic,
          constants.kafka.lowPriorityTopic,
        ],
        fromBeginning: true,
      });

      await this.setupKafkaConsumer();
      logger.info(`Webhook event processor initialized`);
    } catch (error) {
      logger.error(`Failed to initialize event processor: ${error}`);
      throw error;
    }
  }

  /**
   * Setup Kafka Consumer
   * @todo: this will be implemented in the next step
   * @todo: it wil handle the actual webhoook delivery logic
   */
  private async setupKafkaConsumer() {
    await this.consumer.run({
      autoCommit: true,
      autoCommitInterval: 5000,
      autoCommitThreshold: 100,
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;

          const event = JSON.parse(message.value.toString());
          logger.info(
            `Processing message from topic ${topic} : ${JSON.stringify({
              partition,
              offset: message.offset,
              eventId: event.id,
            })}`
          );

          switch (topic) {
            case constants.kafka.topic:
              // Handle main webhook events
              logger.info(`Processing webhook event: ${event.id}`);
              break;

            case constants.kafka.webhookRetry:
              // Handle retry events
              logger.info(`Processing retry event: ${event.id}`);
              break;

            case constants.kafka.mediumPriorityTopic:
              // Handle medium priority events
              logger.info(`Processing medium priority event: ${event.id}`);
              break;

            case constants.kafka.lowPriorityTopic:
              // Handle low priority events
              logger.info(`Processing low priority event: ${event.id}`);
              break;
          }

          // Add your webhook processing logic here
        } catch (error) {
          logger.error(`Error processing message: ${error}`);
        }
      },
    });
  }

  /**
   * Start Delivery Worker that runs every minute
   */
  private async startDeliveryWorker() {
    setInterval(async () => {
      try {
        const failedDeliveries = await WebhookDeliveryRepository.findFailedDeliveries();

        for (const delivery of failedDeliveries) {
          const subscription = await WebhookSubscriptionRepository.findSubscriptionById(delivery.webhookId);
          if (subscription && subscription.isActive) {
            await kafka_produce(constants.kafka.webhookRetry, JSON.stringify(delivery));
            logger.info(`Requeued failed delivery: ${delivery._id}`);
          }
        }
      } catch (error) {
        logger.error(`Webhook delivery worker error: ${error}`);
      }
    }, 60000);
  }

  async checkHealth(): Promise<boolean> {
    try {
      return await verifyConnection();
    } catch (error) {
      logger.error(`Health check failed: ${error}`);
      return false;
    }
  }

  async shutdown() {
    try {
      await this.consumer.disconnect();
      logger.info('Webhook system shutdown complete');
    } catch (error) {
      logger.error(`Error during webhook system shutdown: ${error}`);
    }
  }
}
