import { createServer } from 'http';
import app from './app.module';
import { connectDB } from './core/connections/mongo-connection';
import { initializeSocket } from './core/socket/socket';
import { configuration } from './shared/config';
import { constants } from './shared/constants';
import { initialize_consumer } from './shared/libraries/kafka/kafka-consumer.service';
import { initialize_producer } from './shared/libraries/kafka/kafka-producer.service';
import { redis_subscribe } from './shared/libraries/redis/pubsub.service';
import { logger } from './shared/libraries/utils/logger';

connectDB().then(() => {
  const PORT = configuration().PORT;
  const httpServer = createServer(app);

  // socket initialize
  initializeSocket(httpServer);

  // example redis channel subscribing
  redis_subscribe(constants.redis.channelName, (message) => {
    logger.info(`Received message on example-channel : ${message}`);
  });

  // kafka producer/consumer initialize
  initialize_producer();
  initialize_consumer(constants.kafka.topic);

  httpServer.listen(PORT, () => {
    logger.success(`Server is running on port http://localhost:${PORT}`);
  });
});
