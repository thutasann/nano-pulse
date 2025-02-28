import { Router } from 'express';
import { ResponseHandler } from '../../shared/libraries/utils/response-handler.util';
/**
 * Welcome Route
 * @description Welcome Route
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
const welcomeRoute = Router();

welcomeRoute.get('/', (req, res) => {
  ResponseHandler.success(res, 'Welcome to the Nano Pulse Webhook Service');
});

export default welcomeRoute;
