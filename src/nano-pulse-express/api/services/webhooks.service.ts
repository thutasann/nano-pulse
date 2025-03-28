import crypto from 'crypto';
import { redis, redisPub, redisRateLimit, redisSub } from '../../core/connections/redis-connection';
import { WebhookEventSchema } from '../../core/zod-schemas/webhooks/webhooks.schema';
import { constants } from '../../shared/constants';
import { kafka_produce } from '../../shared/libraries/kafka/kafka-producer.service';
import { logger } from '../../shared/libraries/utils/logger';
import { WebhookEvent, WebhookSubscription } from '../../shared/types/webhooks/webhooks.base.type';
import { WebhookDeliveryRepository } from '../repositories/webhooks-delivery.repository';
import { WebhookSubscriptionRepository } from '../repositories/webhooks-subscription.repository';

/**
 * Webhooks Service
 * @description This service is responsible for processing webhook events
 * 1. Priority based delivery
 * - HIGH: Redis for immediate processing
 * - MEDIUM: Kafka for reliable processing
 * - LOW: Kafka with batch processing
 * 2. Robust error handling
 * - Detailed error logging
 * - Proper error propagation
 * 3. Real-time stats
 * - Event counts
 * - Events per minute
 * - Event type distribution
 * - Timeline data
 * 4. Retry mechanism
 * - Exponential backoff
 * - Configurable retry limits
 * - Delivery status tracking
 * 5. Performance features
 * - Parallel processing of subscriptions
 * - Efficient database operations
 * - Redis caching
 * - Proper logging
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export class WebhooksService {
  private static instance: WebhooksService;
  /** High Priority Queue for Redis */
  private readonly HIGH_PRIORITY_QUEUE = constants.webhookPriorityQueue.high;
  /** Medium Priority Topic for Kafka */
  private readonly REDIS_QUEUE = constants.redis.redisQueue;
  /** Medium Priority Topic for Kafka */
  private readonly MEDIUM_PRIORITY_TOPIC = constants.webhookPriorityQueue.medium;
  /** Low Priority Topic for Kafka */
  private readonly LOW_PRIORITY_TOPIC = constants.webhookPriorityQueue.low;

  private constructor() {}

  /**
   * Get Webhooks Service Instance
   * @returns
   */
  static getInstance(): WebhooksService {
    if (!WebhooksService.instance) {
      WebhooksService.instance = new WebhooksService();
    }
    return WebhooksService.instance;
  }

  /**
   * Generate Signature
   * @param payload - payload
   * @param secret - secret
   */
  private generateSignature<T>(payload: T, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    return hmac.update(JSON.stringify(payload)).digest('hex');
  }

  /**
   * Update Realtime Stats
   * @param subscriptionId - subscription id
   * @param eventType - event type
   */
  private async updateRealtimeStats(subscriptionId: string, eventType: string) {
    const key = `stats:webhook:${subscriptionId}`;
    const now = Date.now();

    try {
      await redis
        .multi()
        .hincrby(key, 'total_events', 1)
        .hincrby(key, `event_type:${eventType}`, 1)
        .zadd(`${key}:timeline`, now, now.toString())
        .expire(key, 86400) // 24 hour
        .exec();
    } catch (error) {
      logger.error(`Failed to update real-time stas: ${error}`);
    }
  }

  /**
   * Process Individual Subscription
   * @param event - webhook event
   * @param subscription - webhook subscription
   */
  private async processSubscription(event: WebhookEvent, subscription: WebhookSubscription) {
    try {
      const delivery = await WebhookDeliveryRepository.createDelivery({
        webhookId: subscription.clientId,
        eventId: event.id,
        payload: event.payload,
        status: 'pending',
        attemptCount: 0,
      });

      const signature = this.generateSignature(event.payload, subscription.secret);

      const deliveryPayload = {
        id: delivery?._id,
        event,
        subscription,
        signature,
        timestamp: new Date(),
        attempts: 0,
      };

      switch (subscription.priority) {
        case 'HIGH':
          await redis.lpush(this.HIGH_PRIORITY_QUEUE, JSON.stringify(deliveryPayload));
          await redisPub.publish(this.REDIS_QUEUE, JSON.stringify(deliveryPayload));
          logger.info(`High priority webhook queued to Redis: ${delivery?._id}`);
          break;

        case 'MEDIUM':
          await kafka_produce(this.MEDIUM_PRIORITY_TOPIC, JSON.stringify(deliveryPayload));
          logger.info(`Medium priority webhook queued to Kafka: ${delivery?._id}`);
          break;

        case 'LOW':
          await kafka_produce(this.LOW_PRIORITY_TOPIC, JSON.stringify(deliveryPayload));
          logger.info(`Low priority webhook queued to Kafka: ${delivery?._id}`);
          break;
      }

      await this.updateRealtimeStats(subscription.clientId, event.type);

      return delivery;
    } catch (error) {
      logger.error(`Failed to process subscription: ${error}`);
      throw error;
    }
  }

  /**
   * Remove All Listeners
   * @description Remove all listeners
   */
  private removeAllListeners(): void {
    redisSub.removeAllListeners();
    redisPub.removeAllListeners();
    redis.removeAllListeners();
    redisRateLimit.removeAllListeners();
  }

  /**
   * Process Webhook Event
   * @param event - event to be processed
   */
  async processWebhookEvent(event: WebhookEvent) {
    try {
      const validatedEvent = WebhookEventSchema.parse(event);

      const subscriptions = await WebhookSubscriptionRepository.findActiveSubscriptionsByEventType(validatedEvent.type);
      logger.info(`Found ${subscriptions.length} active subscriptions for event ${validatedEvent.type}`);

      const deliveryResults = await Promise.allSettled([
        subscriptions?.map((subscription) => this.processSubscription(validatedEvent, subscription)),
      ]);

      deliveryResults?.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.error(`Failed to process subscription ${subscriptions[index]?.clientId}: ${result.reason}`);
        }
      });

      return {
        eventId: validatedEvent.id,
        processed: deliveryResults.filter((r) => r.status === 'fulfilled').length,
        failed: deliveryResults.filter((r) => r.status === 'rejected').length,
      };
    } catch (error) {
      logger.error(`Failed to process webhook event: ${error}`);
      throw error;
    }
  }

  /**
   * Retry Failed Webhook
   * @param deliveryId - delivery ID
   */
  async retryFailedWebhook(deliveryId: string) {
    try {
      const delivery = await WebhookDeliveryRepository.findDeliveryById(deliveryId);
      if (!delivery) {
        throw new Error('Delivery not found');
      }

      const subscription = await WebhookSubscriptionRepository.findById(delivery.webhookId);
      if (!subscription || !subscription.isActive) {
        throw new Error('Subscription not found or incative');
      }

      // Check retry limits
      if (delivery.attemptCount >= subscription.retryConfig.maxRetries) {
        await WebhookDeliveryRepository.updateDeliveryStatus(deliveryId, 'failed', {
          error: 'Max retries exceeded',
        });
        return { status: 'failed', reason: 'Max retries exceeded' };
      }

      // Calculate next retry time with exponential backoff
      const delay = Math.min(
        subscription.retryConfig.initialDelay * Math.pow(2, delivery.attemptCount),
        subscription.retryConfig.maxDelay
      );

      const updatedDelivery = await WebhookDeliveryRepository.updateDeliveryStatus(deliveryId, 'pending', {
        attemptCount: delivery.attemptCount + 1,
        nextRetryAt: new Date(Date.now() + delay),
      });

      // Queue for retry
      await redis.zadd(
        'webhook:retries',
        Date.now() + delay,
        JSON.stringify({
          ...delivery,
          attemptCountd: updatedDelivery?.attemptCount,
        })
      );

      return {
        status: 'requeued',
        nextAttempt: new Date(Date.now() + delay),
        attemptCount: updatedDelivery?.attemptCount,
      };
    } catch (error) {
      logger.error(`Failed to retry webhook: ${error}`);
      throw error;
    }
  }

  /**
   * Get Webhook Stats
   * @param subscriptionId - subscription id
   * @todo: Implement realtime stats
   * @description Get the webhook stats for a given subscription
   * - Delivery stats
   * - Realtime stats
   * @returns
   */
  async getWebhookStats(subscriptionId: string) {
    try {
      const [deliveryStats] = await Promise.all([WebhookDeliveryRepository.getDeliveryAnalytics(subscriptionId)]);

      return {
        ...deliveryStats,
      };
    } catch (error) {
      logger.error(`Failed to get webhook stats: ${error}`);
      throw error;
    }
  }

  /**
   * Shutdown Webhooks Service
   * @description Shutdown the webhooks service
   * - Remove all listeners
   * - Clear any timers or intervals
   */
  async shutdown(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.removeAllListeners();
  }
}
