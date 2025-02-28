import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ApiGateway } from './core/middlewares/api-gateway.middleware';
import { errorHandler } from './core/middlewares/error-handler.middleware';
import { configureRoutes } from './core/routes';
import { apiConfig } from './shared/constants/api-config.constants';

/**
 * Nano Pulse Express Application
 * @description Nano Pulse Express Main Application that handles all the routes and middlewares
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

// global rate limiting
app.use(ApiGateway.rateLimit(apiConfig.rateLimits.general));

// API Routes with specific rate limiting
// app.use(apiConfig.routes.webhook, ApiGateway.rateLimit(apiConfig.rateLimits.webhook));

// routes
configureRoutes(app);

// error handler
app.use(errorHandler);

export default app;
