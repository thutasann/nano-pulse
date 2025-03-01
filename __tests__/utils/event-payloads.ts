import { WebhookEvent } from '../../src/shared/types/webhooks/webhooks.base.type';

export const eventPayloads: WebhookEvent[] = [
  {
    id: 'evt_user_created_001',
    type: 'user.created',
    priority: 'HIGH',
    metadata: {
      timestamp: new Date(),
      source: 'test',
      clientId: 'test-123',
    },
    payload: {
      userId: 'usr_123',
      email: 'john@example.com',
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'evt_payment_success_001',
    type: 'payment.succeeded',
    priority: 'HIGH',
    payload: {
      paymentId: 'pay_123',
      amount: 1999,
      currency: 'USD',
      customerId: 'cus_123',
    },
  },
  {
    id: 'evt_order_updated_001',
    type: 'order.updated',
    priority: 'MEDIUM',
    payload: {
      orderId: 'ord_123',
      status: 'shipped',
      trackingNumber: '1Z999AA1234567890',
    },
    metadata: {
      timestamp: new Date(),
      source: 'test',
      clientId: 'test-123',
    },
  },
];
