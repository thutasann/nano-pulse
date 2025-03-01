import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.module';
import { redis, redisPub, redisRateLimit, redisSub } from '../src/core/connections/redis-connection';
import { configuration } from '../src/shared/config';
import { WebhookEvent } from '../src/shared/types/webhooks/webhooks.base.type';

describe('Webhook Routes Integration Tests', () => {
  const API_KEY = 'test-123';
  let deliveryId: string;

  beforeAll(async () => {
    redis.removeAllListeners();
    redisPub.removeAllListeners();
    redisSub.removeAllListeners();
    redisRateLimit.removeAllListeners();

    await mongoose.connect(configuration().MONGO_URI || '');
  });

  afterAll(async () => {
    await Promise.all([
      mongoose.connection.close(),
      new Promise((resolve) => {
        redis.quit().finally(() => resolve(true));
      }),
      new Promise((resolve) => {
        redisPub.quit().finally(() => resolve(true));
      }),
      new Promise((resolve) => {
        redisSub.quit().finally(() => resolve(true));
      }),
      new Promise((resolve) => {
        redisRateLimit.quit().finally(() => resolve(true));
      }),
    ]);
  });

  describe('POST /webhooks/events', () => {
    const eventPayloads: WebhookEvent[] = [
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

    test('should handle single webhook event', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/events')
        .set('x-api-key', API_KEY)
        .send(eventPayloads[0]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      deliveryId = response.body.data.deliveryId;
    });

    // test('should handle concurrent webhook events', async () => {
    //   const requests = eventPayloads.map((payload) =>
    //     request(app).post('/api/v1/webhooks/events').set('x-api-key', API_KEY).send(payload)
    //   );

    //   const responses = await Promise.all(requests);

    //   responses.forEach((response) => {
    //     expect(response.status).toBe(200);
    //     expect(response.body.success).toBe(true);
    //   });
    // });

    // test('should handle rate limiting', async () => {
    //   const requests = Array(1100)
    //     .fill(eventPayloads[0])
    //     .map((payload) => request(app).post('/api/v1/webhooks/events').set('x-api-key', API_KEY).send(payload));

    //   const responses = await Promise.all(requests);

    //   const successCount = responses.filter((r) => r.status === 200).length;
    //   const rateLimitedCount = responses.filter((r) => r.status === 429).length;

    //   expect(successCount).toBeLessThanOrEqual(1000);
    //   expect(rateLimitedCount).toBeGreaterThan(0);
    // });
  });
});
