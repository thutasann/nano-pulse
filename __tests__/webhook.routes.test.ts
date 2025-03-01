import mongoose from 'mongoose';
import request from 'supertest';
import { WebhooksService } from '../src/api/services/webhooks.service';
import app from '../src/app.module';
import { redis, redisPub, redisRateLimit, redisSub } from '../src/core/connections/redis-connection';
import { configuration } from '../src/shared/config';
import {
  initialize_kafka_producer,
  shutdown_kafka_producer,
} from '../src/shared/libraries/kafka/kafka-producer.service';
import { eventPayloads } from './utils/event-payloads';
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

    await initialize_kafka_producer();

    await mockSubscriptions();
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const webhookService = WebhooksService.getInstance();
      await webhookService.shutdown();
      await shutdown_kafka_producer();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }

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
    test('should handle single webhook event', async () => {
      const response = await request(app)
        .post('/api/v1/webhooks/events')
        .set('x-api-key', API_KEY)
        .send(eventPayloads[2]);

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
  });
});
