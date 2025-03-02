import { Application } from 'express';
import { constants } from '../../shared/constants';
import { ApiGateway } from '../middlewares/api-gateway.middleware';
import webhooksRoute from './webhooks.route';
import welcomeRoute from './welcome.route';

const apiConfig = constants.api;

/**
 * Configure Routes
 * @description Configure all the routes for the application
 * @param app - Express application instance
 * @version 1.0.0
 * @author [thutasann](https://github.com/thutasann)
 */
export function configureRoutes(app: Application): void {
  app.use(apiConfig.routes.welcome, welcomeRoute);
  app.use(apiConfig.routes.webhook, ApiGateway.authenticate(), webhooksRoute);
}
