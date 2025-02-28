import { Router } from 'express';
import { ResponseHandler } from '../../shared/libraries/utils/response-handler.util';

/**
 * Webhooks Route
 * @description Webhooks Route
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
const webhooksRoute = Router();

webhooksRoute.get('/', (req, res) => {
  ResponseHandler.success(res, 'Hello From Webhooks Route');
});

export default webhooksRoute;
