import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './core/middlewares/error-handler.middleware';
import { configureRoutes } from './core/routes';

/**
 * Nano Pulse Express Application
 * @description Express application instance
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
const app: Application = express();

// middlewares
app.use(helmet());
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('combined'));

// routes
configureRoutes(app);

// error handler
app.use(errorHandler);

export default app;
