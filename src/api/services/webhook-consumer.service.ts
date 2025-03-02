import { kafka_consumer } from '../../core/connections/kafka-connection';
import { redisQueue, redisSub } from '../../core/connections/redis-connection';
import { constants } from '../../shared/constants';
import { socket } from '../../shared/libraries/socket/socket.service';
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
  /** High Priority Queue for Redis */
  private readonly HIGH_PRIORITY_QUEUE = constants.webhookPriorityQueue.high;
  /** Redis Queue */
  private readonly REDIS_QUEUE = constants.redis.redisQueue;
  /** Medium Priority Topic for Kafka */
  private readonly MEDIUM_PRIORITY_TOPIC = constants.webhookPriorityQueue.medium;
  /** Low Priority Topic for Kafka */
  private readonly LOW_PRIORITY_TOPIC = constants.webhookPriorityQueue.low;

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
    redisSub.subscribe(this.REDIS_QUEUE, async (err) => {
      if (err) {
        logger.error(`[Webhook Consumer Service] Redis subscription error : ${err}`);
        return;
      }
    });

    redisSub.on('message', async (channel, message) => {
      if (channel === this.REDIS_QUEUE) {
        const payload: DeliveryPayload = JSON.parse(message);
        logger.info(`[Webhook Consumer] Received message : ${payload.id}  from Redis`);
        await this.processDelivery(payload);
      }
    });

    this.processRedisQueue();
  }

  /**
   * Initialize Kafka Consumers
   */
  private async initializeKafkaConsumers() {
    try {
      const consumer = kafka_consumer;

      await consumer.subscribe({
        topics: [this.MEDIUM_PRIORITY_TOPIC, this.LOW_PRIORITY_TOPIC],
        fromBeginning: true,
      });

      await consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;
          const payload: DeliveryPayload = JSON.parse(message.value.toString());
          await this.processDelivery(payload);
        },
      });

      logger.success('Kafka consumers initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize Kafka consumers: ${error}`);
      throw error;
    }
  }

  /**
   * Process Existing items in the Redis Queue
   */
  private async processRedisQueue() {
    while (true) {
      try {
        const message = await redisQueue.rpop(this.HIGH_PRIORITY_QUEUE);
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
   */
  private async processDelivery(payload: Partial<WebhookDeliveryDocument>) {
    try {
      await WebhookDeliveryRepository.updateDeliveryStatus(payload.id as string, 'success', payload);

      socket.emitToAll('notification', {
        id: payload.id,
        type: 'info',
        message: 'Webhook Delivery Successfully',
        timestamp: new Date(),
      });

      logger.info(`[Webhook Consumer] Update Delivery Status Successfully : ${payload.id}`);
    } catch (error) {
      logger.error(`[Webhook Consumer] Update Delivery Status Failed : ${error}`);
    }
  }

  /**
   * Kafka Consumer Service Shutdown
   */
  public async shutdown() {
    try {
      await kafka_consumer.disconnect();
      await redisSub.unsubscribe();
      await redisQueue.quit();
      logger.info('Webhook consumer service shut down successfully');
    } catch (error) {
      logger.error(`Error shutting down webhook consumer: ${error}`);
    }
  }
}
