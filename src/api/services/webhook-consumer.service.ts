import { kafka_consumer } from '../../core/connections/kafka-connection';
import { redis, redisSub } from '../../core/connections/redis-connection';
import { constants } from '../../shared/constants';
import { logger } from '../../shared/libraries/utils/logger';
import { DeliveryPayload } from '../../shared/types/webhooks/delivery-payload.type';
import { WebhookDeliveryDocument } from '../models/webhooks-delivery.model';
import { WebhookDeliveryRepository } from '../repositories/webhooks-delivery.repository';

/**
 * Webhook Consumer Service
 * @description - Consume webhook events from Redis and Kafka
 * - Consume webhook events from Redis and Kafka
 * - Process webhook events
 * @author - [thuta](https://github.com/thutasann)
 * @version - 1.0.0
 */
export class WebhookConsumerService {
  private static instance: WebhookConsumerService;
  private readonly HIGH_PRIORITY_QUEU = constants.webhookPriorityQueue.high;

  private constructor() {
    this.initializeConsumers();
  }

  public static getInstance(): WebhookConsumerService {
    if (!WebhookConsumerService.instance) {
      WebhookConsumerService.instance = new WebhookConsumerService();
    }
    return WebhookConsumerService.instance;
  }

  /**
   * Initialize Consumers
   * - Initialize Redis Consumer
   * - Initialize Kafka Consumers
   */
  private async initializeConsumers() {
    try {
      await this.initializeRedisConsumer();
      await this.initializeKafkaConsumers();
      logger.success(`Webhook Consumer Service initialization success`);
    } catch (error) {
      logger.error(`Webhook Consumer Service initialization Failed : ${error}`);
    }
  }

  /**
   * Initialise Redis Consumer
   * - Subscribe to Redis pub/sub for High priority webhooks
   */
  private async initializeRedisConsumer() {
    redisSub.subscribe(constants.webhook.webhookQueue, async (err) => {
      if (err) {
        logger.error(`[Webhook Consumer Service] Redis subscription error : ${err}`);
        return;
      }
    });

    redisSub.on('message', async (channel, message) => {
      if (channel === constants.webhook.webhookQueue) {
        const payload: DeliveryPayload = JSON.parse(message);
        await this.processDelivery(payload);
      }
    });

    this.processRedisQueue();
  }

  /**
   * Initialize Kafka Consumers
   */
  private async initializeKafkaConsumers() {
    const consumer = kafka_consumer;

    await consumer.subscribe({
      topics: [constants.kafka.mediumPriorityTopic, constants.kafka.lowPriorityTopic],
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;
        const payload: DeliveryPayload = JSON.parse(message.value.toString());
        await this.processDelivery(payload);
      },
    });
  }

  /**
   * Process Existing items in the Redis Queue
   */
  private async processRedisQueue() {
    while (true) {
      try {
        const message = await redis.rpop(this.HIGH_PRIORITY_QUEU);
        if (!message) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        const payload: DeliveryPayload = JSON.parse(message);
        await this.processDelivery(payload);
      } catch (error) {
        logger.error(`Error processing Redis queue: ${error}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Process Webhook Delivery
   * @param payload - Webhok Delivery Payload
   * @todo - Third Party Integrations
   * @todo - Requeue Delivery if failed
   *
   */
  private async processDelivery(payload: Partial<WebhookDeliveryDocument>) {
    try {
      await WebhookDeliveryRepository.updateDeliveryStatus(payload._id as string, 'success', payload);
      logger.info(`[Webhook Consumer] Successfully delivered webhook: ${payload._id}`);
    } catch (error) {
      logger.error(`[Webhook Consumer] Webhook Delivery Process Failed : ${error}`);
    }
  }

  /**
   * Kafka Consumer Service Shutdown
   */
  public async shutdown() {
    try {
      await kafka_consumer.disconnect();
      await redisSub.unsubscribe();
      logger.info('Webhook consumer service shut down successfully');
    } catch (error) {
      logger.error(`Error shutting down webhook consumer: ${error}`);
    }
  }
}
