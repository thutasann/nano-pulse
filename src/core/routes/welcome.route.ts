import { Router } from 'express';

/**
 * Welcome Route
 * @description Welcome Route
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
const welcomeRoute = Router();

welcomeRoute.get('/', (req, res) => {
  res.send('Welcome to the Nano Pulse Webhook Service');
});

export default welcomeRoute;
