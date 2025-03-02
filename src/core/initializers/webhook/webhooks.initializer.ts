import { constants } from '../../../shared/constants';
import { kafka_produce } from '../../../shared/libraries/kafka/kafka-producer.service';
import { logger } from '../../../shared/libraries/utils/logger';
import { redis } from '../../connections/redis-connection';
import { WebhookEventSchema } from '../../zod-schemas/webhooks/webhooks.schema';

/**
 * Webhook Initializer
 * @description Initialize the webhook system
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export class WebhookInitializer {
  private static instance: WebhookInitializer;
  private readonly WEBHOOK_QUEUE = constants.webhook.webhookQueue;
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
   * Initialize Event Bus - Essential for receiving webhook events
   * - Subscribe to the webhook queue
   * - Produce webhook events to the Kafka topic
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
   * Initialize Webhook Event Bus
   */
  async initialize() {
    if (this.isInitialized) return;
    try {
      await this.initializeEventBus();
      this.isInitialized = true;
      logger.success(`Webhook System Event Bus Initialized`);
    } catch (error) {
      logger.error(`Webhook System Event Bus Initialization Failed: ${error}`);
      throw error;
    }
  }
}
