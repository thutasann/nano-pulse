import mongoose from 'mongoose';
import request from 'supertest';
import { WebhooksService } from '../src/api/services/webhooks.service';
import app from '../src/app.module';
import { redis, redisPub, redisRateLimit, redisSub } from '../src/core/connections/redis-connection';
import { configuration } from '../src/shared/config';
import { WebhookEvent } from '../src/shared/types/webhooks/webhooks.base.type';
import { mockSubscriptions } from './utils/mock-subscriptions';

describe('Webhook Routes Integration Tests', () => {
  const API_KEY = 'test-123';
  let deliveryId: string;

  beforeAll(async () => {
    await Promise.all([
      new Promise((resolve) => redis.once('ready', resolve)),
      new Promise((resolve) => redisPub.once('ready', resolve)),
      new Promise((resolve) => redisSub.once('ready', resolve)),
      new Promise((resolve) => redisRateLimit.once('ready', resolve)),
    ]);

    await mongoose.connect(configuration().MONGO_URI || '');

    await mockSubscriptions();
  });

  afterEach(async () => {
    // Wait for any pending webhook processing to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Clean up
    try {
      // Wait for any pending operations
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Stop the webhook service
      const webhookService = WebhooksService.getInstance();
      await webhookService.shutdown(); // Add this method to your WebhooksService

      // await mongoose.connection.dropDatabase();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }

    // Close connections with proper waiting
    await Promise.all([
      mongoose.connection.close(),
      new Promise((resolve) => {
        redis.disconnect();
        redis.on('end', resolve);
      }),
      new Promise((resolve) => {
        redisPub.disconnect();
        redisPub.on('end', resolve);
      }),
      new Promise((resolve) => {
        redisSub.disconnect();
        redisSub.on('end', resolve);
      }),
      new Promise((resolve) => {
        redisRateLimit.disconnect();
        redisRateLimit.on('end', resolve);
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

    it('should process webhook event', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/events')
        .set('x-api-key', API_KEY)
        .send(eventPayloads[0]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(response.status).toBe(200);
    });
  });
});
