import { z } from 'zod';

/**
 * Retry Configuration Zod Schema
 * @description This schema is used to configure the retry configuration for the webhook.
 */
export const RetryConfigSchema = z.object({
  maxRetries: z.number().min(1).max(10).default(5),
  initialDelay: z.number().min(100).max(5000).default(1000),
  maxDelay: z.number().min(1000).max(60000).default(32000),
  backoffMultiplier: z.number().min(1).max(5).default(2),
});

/**
 * Rate Limit Configuration Zod Schema
 * @description This schema is used to configure the rate limit for the webhook.
 */
export const RateLimitSchema = z.object({
  maxRequests: z.number().min(1).max(1000).default(100),
  timeWindowMs: z.number().min(1000).max(60000).default(60000),
});

export const WebhookSubscriptionPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

/**
 * Webhook Subscription Zod Schema
 * @description This schema is used to configure the webhook subscription.
 */
export const WebhookSubscriptionSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  priority: WebhookSubscriptionPrioritySchema,
  secret: z.string().min(32),
  isActive: z.boolean().default(true),
  retryConfig: RetryConfigSchema,
  rateLimit: RateLimitSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Webhook Delivery Zod Schema
 * @description This schema is used to configure the webhook delivery.
 */
export const WebhookDeliverySchema = z.object({
  webhookId: z.string(),
  eventId: z.string(),
  payload: z.any(),
  status: z.enum(['pending', 'success', 'failed', 'retry', 'dead-letter']),
  statusCode: z.number().optional(),
  response: z.string().optional(),
  error: z.string().optional(),
  attemptCount: z.number().default(0),
  nextRetryAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Webhook Event Zod Schema
 * @description This schema is used to configure the webhook event.
 */
export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.any(),
  payload: z.any(),
  priority: z.string().optional(),
  metadata: z
    .object({
      timestamp: z.date(),
      source: z.string(),
      clientId: z.string(),
    })
    .and(z.record(z.string(), z.any()))
    .optional(),
});
