import { Router } from 'express';
import { WebhooksController } from '../../api/controllers/webhooks.controller';
import { ApiGateway } from '../../core/middlewares/api-gateway.middleware';
import { ResponseHandler } from '../../shared/libraries/utils/response-handler.util';

/**
 * Webhooks Route
 * @description Webhooks Route
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
const webhooksRoute = Router();
const controller = new WebhooksController();

webhooksRoute.get('/', (req, res) => {
  ResponseHandler.success(res, 'Hello From Webhooks Route');
});

webhooksRoute.post(
  '/events',
  ApiGateway.authenticate(),
  ApiGateway.rateLimit({
    windowMs: 60000,
    max: 1000,
    keyPrefix: 'webhook:events:',
  }),
  controller.triggerEvent
);

webhooksRoute.get('/stats/:subscriptionId', ApiGateway.authenticate(), controller.getStats.bind(controller));

webhooksRoute.post(
  '/retry/:deliveryId',
  ApiGateway.authenticate(),
  ApiGateway.rateLimit({
    windowMs: 60000,
    max: 50,
    keyPrefix: 'webhook:retry:',
  }),
  controller.retryWebhook
);

export default webhooksRoute;
