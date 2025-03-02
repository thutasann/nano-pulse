import { faker } from '@faker-js/faker';
import { WebhookSubscriptionRepository } from '../../src/nano-pulse-express/api/repositories/webhooks-subscription.repository';
import { WebhookSubscriptionPrioritySchema } from '../../src/nano-pulse-express/core/zod-schemas/webhooks/webhooks.schema';
import { WebhookSubscription } from '../../src/nano-pulse-express/shared/types/webhooks/webhooks.base.type';

// Get valid priorities from the schema
const PRIORITIES = WebhookSubscriptionPrioritySchema.options;

// Event types that match our schema
const EVENT_TYPES = [
  'user.created',
  'user.updated',
  'user.deleted',
  'payment.succeeded',
  'payment.failed',
  'payment.refunded',
  'order.created',
  'order.updated',
  'order.cancelled',
] as const;

function generateValidSubscription(index: number): Omit<WebhookSubscription, 'createdAt' | 'updatedAt'> {
  const subscription = {
    clientId: `test-${faker.string.alphanumeric(8)}`,
    name: `Subscription ${index} - ${faker.company.catchPhrase()}`.slice(0, 100),
    description: faker.lorem.sentence().slice(0, 500),
    url: `https://webhook-test-${faker.internet.domainWord()}.com/endpoint${index}`,
    events: faker.helpers.arrayElements(EVENT_TYPES, { min: 1, max: 3 }),
    priority: faker.helpers.arrayElement(PRIORITIES),
    secret: `test_secret_key_${faker.string.alphanumeric(32)}`,
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    retryConfig: {
      maxRetries: faker.number.int({ min: 1, max: 10 }),
      initialDelay: faker.number.int({ min: 100, max: 5000 }),
      maxDelay: faker.number.int({ min: 1000, max: 60000 }),
      backoffMultiplier: faker.number.int({ min: 1, max: 5 }),
    },
    rateLimit: {
      maxRequests: faker.number.int({ min: 1, max: 1000 }),
      timeWindowMs: faker.number.int({ min: 1000, max: 60000 }),
    },
  };

  // Validate against schema
  return subscription;
}

export const mockSubscriptions = async (length: number = 3) => {
  try {
    const subscriptions = Array.from({ length }, (_, index) => generateValidSubscription(index + 1));

    // Add edge case subscriptions that still satisfy the schema
    const edgeCases = [
      // Minimum values subscription
      {
        clientId: 'test-min',
        name: 'Min', // 3 chars minimum
        url: 'https://webhook-test.com/min',
        events: ['user.created'], // Minimum 1 event
        priority: 'LOW',
        secret: 'test_secret_key_'.padEnd(32, '0'), // Exactly 32 chars
        isActive: true,
        retryConfig: {
          maxRetries: 1, // Minimum
          initialDelay: 100, // Minimum
          maxDelay: 1000, // Minimum
          backoffMultiplier: 1, // Minimum
        },
        rateLimit: {
          maxRequests: 1, // Minimum
          timeWindowMs: 1000, // Minimum
        },
      },
      // Maximum values subscription
      {
        clientId: 'test-max',
        name: faker.string.alpha({ length: 100 }), // Maximum length
        description: faker.string.alpha({ length: 500 }), // Maximum length
        url: 'https://webhook-test.com/max',
        events: faker.helpers.arrayElements(EVENT_TYPES, { min: 3, max: 3 }),
        priority: 'HIGH',
        secret: faker.string.alphanumeric(64),
        isActive: true,
        retryConfig: {
          maxRetries: 10, // Maximum
          initialDelay: 5000, // Maximum
          maxDelay: 60000, // Maximum
          backoffMultiplier: 5, // Maximum
        },
        rateLimit: {
          maxRequests: 1000, // Maximum
          timeWindowMs: 60000, // Maximum
        },
      },
    ];

    const allSubscriptions = [...subscriptions, ...edgeCases] as Omit<WebhookSubscription, 'createdAt' | 'updatedAt'>[];

    // Create all subscriptions in parallel
    await Promise.all(
      allSubscriptions.map((subscription) => WebhookSubscriptionRepository.createSubscription(subscription))
    );

    console.log(`Created ${allSubscriptions.length} mock subscriptions`);
  } catch (error) {
    console.error('Error creating mock subscriptions:', error);
    throw error;
  }
};

export const generateTestSubscriptions = async (count: number = 50) => {
  const subscriptions = Array.from({ length: count }, (_, index) => generateValidSubscription(index + 1));

  await Promise.all(
    subscriptions.map((subscription) => WebhookSubscriptionRepository.createSubscription(subscription))
  );

  return subscriptions;
};
