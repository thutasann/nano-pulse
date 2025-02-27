import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { configuration } from './core/config';
import { connectDB } from './core/database/mongo-connection';
import { errorHandler } from './core/middlewares/error-handler.middleware';
import { initializeSocket } from './core/socket/socket';
import { logger } from './core/utils/logger';
import { configureRoutes } from './routes';

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

  configureRoutes(app);

  // custom middlewares
  app.use(errorHandler);

  // socket initialize
  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    logger.success(`Server is running on port http://localhost:${PORT}`);
  });
});
