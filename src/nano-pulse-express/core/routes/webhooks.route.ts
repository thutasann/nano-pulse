import { Router } from 'express';
import { WebhooksController } from '../../api/controllers/webhooks.controller';
import { ApiGateway } from '../../core/middlewares/api-gateway.middleware';

/**
 * Webhooks Route
 * @description Webhooks Route
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
const webhooksRoute = Router();
const controller = new WebhooksController();

webhooksRoute.use(ApiGateway.authenticate());

webhooksRoute.post(
  '/events',
  ApiGateway.rateLimit({
    windowMs: 60000,
    max: 1000,
    keyPrefix: 'webhook:events:',
  }),
  controller.triggerEvent
);

webhooksRoute.get('/stats/:subscriptionId', controller.getStats);

webhooksRoute.post(
  '/retry/:deliveryId',
  ApiGateway.rateLimit({
    windowMs: 60000,
    max: 50,
    keyPrefix: 'webhook:retry:',
  }),
  controller.retryWebhook
);

export default webhooksRoute;
