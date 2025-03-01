import { WebhookSubscriptionRepository } from '../../src/api/repositories/webhooks-subscription.repository';

/**
 * Mock Subscriptions
 * @returns
 */
export const mockSubscriptions = async () => {
  await Promise.all([
    WebhookSubscriptionRepository.createSubscription({
      clientId: 'test-123',
      name: 'User Events Subscription',
      description: 'Handles user-related events',
      url: 'https://webhook-test.com/endpoint1',
      events: ['user.created', 'user.updated'],
      priority: 'HIGH',
      secret: 'test_secret_key_1234567890abcdef1234567890', // min 32 chars
      isActive: true,
      retryConfig: {
        maxRetries: 5,
        initialDelay: 1000,
        maxDelay: 32000,
        backoffMultiplier: 2,
      },
      rateLimit: {
        maxRequests: 100,
        timeWindowMs: 60000,
      },
    }),

    WebhookSubscriptionRepository.createSubscription({
      clientId: 'test-123',
      name: 'Payment Events Subscription',
      description: 'Handles payment-related events',
      url: 'https://webhook-test.com/endpoint2',
      events: ['payment.succeeded', 'payment.failed'],
      priority: 'HIGH',
      secret: 'test_secret_key_1234567890abcdef5678901234', // min 32 chars
      isActive: true,
      retryConfig: {
        maxRetries: 5,
        initialDelay: 1000,
        maxDelay: 32000,
        backoffMultiplier: 2,
      },
      rateLimit: {
        maxRequests: 100,
        timeWindowMs: 60000,
      },
    }),

    WebhookSubscriptionRepository.createSubscription({
      clientId: 'test-123',
      name: 'Order Events Subscription',
      description: 'Handles order-related events',
      url: 'https://webhook-test.com/endpoint3',
      events: ['order.updated', 'order.deleted'],
      priority: 'MEDIUM',
      secret: 'test_secret_key_1234567890abcdef9012345678', // min 32 chars
      isActive: true,
      retryConfig: {
        maxRetries: 5,
        initialDelay: 1000,
        maxDelay: 32000,
        backoffMultiplier: 2,
      },
      rateLimit: {
        maxRequests: 100,
        timeWindowMs: 60000,
      },
    }),
  ]);
};
