import { z } from 'zod';
import {
  RateLimitSchema,
  RetryConfigSchema,
  WebhookDeliverySchema,
  WebhookEventSchema,
  WebhookSubscriptionSchema,
} from '../../../core/zod-schemas/webhooks/webhooks.schema';

/**
 * Retry Config Type Def
 * @description This type is used to define the retry config for the webhook.
 */
export type RetryConfig = z.infer<typeof RetryConfigSchema>;

/**
 * Rate Limit Type Def
 * @description This type is used to define the rate limit for the webhook.
 */
export type RateLimit = z.infer<typeof RateLimitSchema>;

/**
 * Webhook Subscription Type Def
 * @description This type is used to define the webhook subscription.
 */
export type WebhookSubscription = z.infer<typeof WebhookSubscriptionSchema>;

/**
 * Webhook Delivery Type Def
 * @description This type is used to define the webhook delivery.
 */
export type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>;

/**
 * Webhook Event Type Def
 * @description This type is used to define the webhook event.
 */
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
