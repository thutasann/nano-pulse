import { faker } from '@faker-js/faker';
import { WebhookEvent } from '../../src/nano-pulse-express/shared/types/webhooks/webhooks.base.type';

const EVENT_TYPES = {
  USER: ['user.created', 'user.updated', 'user.deleted'],
  PAYMENT: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
  ORDER: ['order.created', 'order.updated', 'order.cancelled'],
} as const;

const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;

/**
 * Generate Random Event Payload based on event type
 */
function generateEventPayload(eventType: string): any {
  switch (true) {
    case eventType.startsWith('user.'):
      return {
        userId: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        avatar: faker.image.avatar(),
        lastActive: faker.date.recent(),
        preferences: {
          language: faker.location.language(),
          timezone: faker.location.timeZone(),
          notifications: faker.datatype.boolean(),
        },
      };

    case eventType.startsWith('payment.'):
      return {
        paymentId: `pay_${faker.string.alphanumeric(10)}`,
        amount: faker.number.float({ min: 100, max: 10000 }),
        currency: faker.finance.currencyCode(),
        customerId: `cus_${faker.string.alphanumeric(8)}`,
        paymentMethod: faker.helpers.arrayElement(['card', 'bank_transfer', 'wallet', 'crypto']),
        status: faker.helpers.arrayElement(['succeeded', 'failed', 'pending', 'refunded']),
        metadata: {
          cardLast4: faker.finance.creditCardNumber('####'),
          cardBrand: faker.helpers.arrayElement(['visa', 'mastercard', 'amex']),
        },
      };

    case eventType.startsWith('order.'):
      return {
        orderId: `ord_${faker.string.alphanumeric(10)}`,
        customerId: `cus_${faker.string.alphanumeric(8)}`,
        status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        amount: faker.number.float({ min: 100, max: 10000 }),
        items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
          productId: `prod_${faker.string.alphanumeric(8)}`,
          quantity: faker.number.int({ min: 1, max: 10 }),
          price: faker.number.float({ min: 10, max: 1000 }),
        })),
        shippingAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: faker.location.country(),
          zipCode: faker.location.zipCode(),
        },
      };

    case eventType.startsWith('product.'):
      return {
        productId: `prod_${faker.string.alphanumeric(10)}`,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        category: faker.commerce.department(),
        inventory: faker.number.int({ min: 0, max: 1000 }),
        images: Array.from({ length: 3 }, () => faker.image.url()),
        metadata: {
          weight: `${faker.number.float({ min: 0.1, max: 10 })}kg`,
          dimensions: {
            length: faker.number.int({ min: 1, max: 100 }),
            width: faker.number.int({ min: 1, max: 100 }),
            height: faker.number.int({ min: 1, max: 100 }),
          },
        },
      };

    case eventType.startsWith('subscription.'):
      return {
        subscriptionId: `sub_${faker.string.alphanumeric(10)}`,
        customerId: `cus_${faker.string.alphanumeric(8)}`,
        plan: faker.helpers.arrayElement(['basic', 'premium', 'enterprise']),
        status: faker.helpers.arrayElement(['active', 'cancelled', 'past_due']),
        currentPeriodStart: faker.date.past(),
        currentPeriodEnd: faker.date.future(),
        amount: faker.number.float({ min: 100, max: 10000 }),
        currency: faker.finance.currencyCode(),
      };

    case eventType.startsWith('invoice.'):
      return {
        invoiceId: `inv_${faker.string.alphanumeric(10)}`,
        customerId: `cus_${faker.string.alphanumeric(8)}`,
        amount: faker.number.float({ min: 100, max: 10000 }),
        currency: faker.finance.currencyCode(),
        status: faker.helpers.arrayElement(['draft', 'open', 'paid', 'void', 'uncollectible']),
        dueDate: faker.date.future(),
        items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
          description: faker.commerce.productName(),
          amount: faker.number.float({ min: 10, max: 1000 }),
          quantity: faker.number.int({ min: 1, max: 10 }),
        })),
      };

    case eventType.startsWith('notification.'):
      return {
        notificationId: `notif_${faker.string.alphanumeric(10)}`,
        recipientId: `user_${faker.string.alphanumeric(8)}`,
        type: faker.helpers.arrayElement(['email', 'sms', 'push']),
        content: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['sent', 'delivered', 'failed']),
        metadata: {
          deviceType: faker.helpers.arrayElement(['ios', 'android', 'web']),
          timestamp: faker.date.recent(),
        },
      };

    default:
      return {
        timestamp: faker.date.recent(),
        data: faker.lorem.sentence(),
      };
  }
}

/**
 * Generate Multiple Event Payloads
 */
function generateEventPayloads(count: number = 100): WebhookEvent[] {
  return Array.from({ length: count }, (): WebhookEvent => {
    const eventCategory = faker.helpers.arrayElement(Object.keys(EVENT_TYPES));
    const eventType = faker.helpers.arrayElement(EVENT_TYPES[eventCategory as keyof typeof EVENT_TYPES]);

    const event = {
      id: `evt_${faker.string.alphanumeric(16)}`,
      type: eventType,
      payload: generateEventPayload(eventType),
      priority: faker.helpers.arrayElement(PRIORITIES),
      metadata: {
        timestamp: faker.date.recent(),
        source: faker.helpers.arrayElement(['api', 'dashboard', 'system']),
        clientId: `client_${faker.string.alphanumeric(8)}`,
        environment: faker.helpers.arrayElement(['production', 'staging', 'development']),
        version: faker.system.semver(),
        requestId: faker.string.uuid(),
      },
    };

    return event;
  });
}

/**
 * Generate 100 event payloads
 * @param count - Number of event payloads to generate
 * @returns Array of event payloads
 */
export const eventPayloads = generateEventPayloads(100);

export const generateEvents = generateEventPayloads;
