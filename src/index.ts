import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app.module';
import { connectDB } from './core/connections/mongo-connection';
import { initializeSocket } from './core/initializers/socket/socket.initializer';
import { WebhookInitializer } from './core/initializers/webhook/webhooks.initializer';
import { configuration } from './shared/config';
import { constants } from './shared/constants';
import { initialize_producer } from './shared/libraries/kafka/kafka-producer.service';
import { redis_subscribe } from './shared/libraries/redis/pubsub.service';
import { logger } from './shared/libraries/utils/logger';

connectDB().then(async () => {
  const PORT = configuration().PORT;
  const httpServer = createServer(app);

  try {
    // Initialize Core Services
    initializeSocket(httpServer);
    await initialize_producer();

    // Initialize Webhook System
    const webhookSystem = WebhookInitializer.getInstance();
    await webhookSystem.initialize();

    // Redis channel subscription
    redis_subscribe(constants.redis.channelName, (message) => {
      logger.info(`Received message on example-channel : ${message}`);
    });

    // Start the HTTP server
    httpServer.listen(PORT, () => {
      logger.success(`Server is running on port http://localhost:${PORT}/api/v1`);
      logger.success(`All Nano Pulse Services Initialized Successfully 🚀`);
    });
  } catch (error) {
    logger.error(`Failed to initialize services: ${error}`);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('SIGINT signal received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
