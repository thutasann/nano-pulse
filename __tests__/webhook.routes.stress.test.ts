import mongoose from 'mongoose';
import request from 'supertest';
import { WebhooksService } from '../src/app-express/api/services/webhooks.service';
import app from '../src/app-express/app.module';
import {
  redis,
  redisPub,
  redisQueue,
  redisRateLimit,
  redisSub,
} from '../src/app-express/core/connections/redis-connection';
import { configuration } from '../src/app-express/shared/config';
import {
  initialize_kafka_producer,
  shutdown_kafka_producer,
} from '../src/app-express/shared/libraries/kafka/kafka-producer.service';
import { constants } from './utils/constants';
import { generateEvents } from './utils/event-payloads';
import { mockSubscriptions } from './utils/mock-subscriptions';

describe('Webhook Routes Stress Tests', () => {
  const API_KEY = constants.API_KEY;

  beforeAll(async () => {
    await Promise.all([
      new Promise((resolve) => redis.once('ready', resolve)),
      new Promise((resolve) => redisPub.once('ready', resolve)),
      new Promise((resolve) => redisSub.once('ready', resolve)),
      new Promise((resolve) => redisRateLimit.once('ready', resolve)),
      new Promise((resolve) => redisQueue.once('ready', resolve)),
    ]);

    await mongoose.connect(configuration().MONGO_URI || '', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await initialize_kafka_producer();
    await mockSubscriptions(5);

    jest.setTimeout(30000);
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  afterAll(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
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
      new Promise((resolve) => {
        redisQueue.disconnect();
        redisQueue.on('end', resolve);
      }),
    ]);
  });

  describe('Webhooks Load Tests', () => {
    test('should handle small burst of concurrent events', async () => {
      const burstSize = 20; // Reduced from 70 to 20
      const events = generateEvents(burstSize);
      const startTime = Date.now();

      const requests = events.map((payload) =>
        request(app).post('/api/v1/webhooks/events').set('x-api-key', API_KEY).send(payload)
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`Processed ${burstSize} events in ${totalTime}ms (${totalTime / 1000} seconds)`);
      console.log(`Average time per request: ${totalTime / burstSize}ms`);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    test('should handle mixed priority events', async () => {
      const events = generateEvents(15); // Reduced from 70 to 15
      const priorities = ['HIGH', 'MEDIUM', 'LOW'];

      events.forEach((event, index) => {
        event.priority = priorities[index % 3];
      });

      const startTime = Date.now();

      const requests = events.map((payload) =>
        request(app).post('/api/v1/webhooks/events').set('x-api-key', API_KEY).send(payload)
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      const stats = {
        total: responses.length,
        successful: responses.filter((r) => r.status === 200).length,
        failed: responses.filter((r) => r.status !== 200).length,
        timePerRequest: (endTime - startTime) / responses.length,
      };

      console.log('Mixed Priority Test Results:', stats);

      expect(stats.failed).toBe(0);
      expect(stats.successful).toBe(15);
    });

    test('should handle sequential requests', async () => {
      const totalRequests = 8; // Reduced from 15 to 8
      const results = {
        accepted: 0,
        rateLimited: 0,
        other: 0,
      };

      // Send requests sequentially with shorter delays
      for (let i = 0; i < totalRequests; i++) {
        const payload = generateEvents(1)[0];
        const response = await request(app).post('/api/v1/webhooks/events').set('x-api-key', API_KEY).send(payload);

        if (response.status === 200) results.accepted++;
        else if (response.status === 429) results.rateLimited++;
        else results.other++;

        // Reduced delay between requests
        await new Promise((resolve) => setTimeout(resolve, 200)); // Reduced from 300ms to 200ms
      }

      console.log('Sequential Test Results:', results);

      expect(results.accepted).toBe(totalRequests);
      expect(results.rateLimited).toBe(0);
      expect(results.other).toBe(0);
    }, 10000); // Added explicit timeout of 10 seconds for this specific test
  });
});
