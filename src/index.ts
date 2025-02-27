import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { connectDB } from './core/connections/mongo-connection';
import { errorHandler } from './core/middlewares/error-handler.middleware';
import { configureRoutes } from './core/routes';
import { initializeSocket } from './core/socket/socket';
import { configuration } from './shared/config';
import { constants } from './shared/constants/app.constants';
import { initialize_consumer } from './shared/libraries/kafka/kafka-consumer.service';
import { initialize_producer } from './shared/libraries/kafka/kafka-producer.service';
import { redis_subscribe } from './shared/libraries/redis/pubsub.service';
import { logger } from './shared/libraries/utils/logger';

connectDB().then(() => {
  const PORT = configuration().PORT;
  const app: Application = express();
  const httpServer = createServer(app);

  // middlewares
  app.use(helmet());
  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(morgan('combined'));

  // configure routes
  configureRoutes(app);

  // custom middlewares
  app.use(errorHandler);

  // socket initialize
  initializeSocket(httpServer);

  // example redis channel subscribing
  redis_subscribe(constants.redis.channelName, (message) => {
    logger.info(`Received message on example-channel : ${message}`);
  });

  initialize_producer();
  initialize_consumer(constants.kafka.topic);

  httpServer.listen(PORT, () => {
    logger.success(`Server is running on port http://localhost:${PORT}`);
  });
});
