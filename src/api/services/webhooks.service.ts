import crypto from 'crypto';
import { redis } from '../../core/connections/redis-connection';
import { WebhookEventSchema } from '../../core/zod-schemas/webhooks/webhooks.schema';
import { constants } from '../../shared/constants';
import { logger } from '../../shared/libraries/utils/logger';
import { WebhookEvent, WebhookSubscription } from '../../shared/types/webhooks/webhooks.base.type';
import { WebhookSubscriptionRepository } from '../repositories/webhooks-subscription.repository';

export class WebhooksService {
  private static instance: WebhooksService;
  private readonly HIGH_PRIORITY_QUEUE = constants.webhookPriorityQueue.high;
  private readonly MEDIUM_PRIORITY_QUEUE = constants.webhookPriorityQueue.medium;
  private readonly LOW_PRIORITY_QUEUE = constants.webhookPriorityQueue.low;

  private constructor() {}

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
   * @returns
   */
  private generateSignature<T>(payload: T, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    return hmac.update(JSON.stringify(payload)).digest('hex');
  }

  /**
   *
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
  private async processSubscription(event: WebhookEvent, subscription: WebhookSubscription) {}

  /**
   * Process Webhook Event
   * @param event - event to be processed
   */
  async processWebhookEvent(event: WebhookEvent) {
    try {
      const validatedEvent = WebhookEventSchema.parse(event);
      const { priority = 'LOW' } = validatedEvent;

      const subscriptions = await WebhookSubscriptionRepository.findActiveSubscriptionsByEventType(validatedEvent.type);
      logger.info(`Found ${subscriptions.length} active subscriptions for event ${validatedEvent.type}`);
    } catch (error) {}
  }
}
