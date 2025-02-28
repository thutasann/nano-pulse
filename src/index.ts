import { createServer } from 'http';
import app from './app.module';
import { connectDB } from './core/connections/mongo-connection';
import { initializeSocket } from './core/socket/socket';
import { configuration } from './shared/config';
import { constants } from './shared/constants';
import { redis_subscribe } from './shared/libraries/redis/pubsub.service';
import { logger } from './shared/libraries/utils/logger';

connectDB().then(async () => {
  const PORT = configuration().PORT;
  const httpServer = createServer(app);

  try {
    initializeSocket(httpServer);
    // await initialize_producer();
    // await initialize_consumer(constants.kafka.topic);
    // await initializeWebhookSystem();

    // Redis channel subscription
    redis_subscribe(constants.redis.channelName, (message) => {
      logger.info(`Received message on example-channel : ${message}`);
    });

    httpServer.listen(PORT, () => {
      logger.success(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to initialize services: ${error}`);
    process.exit(1);
  }
});
