import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../../shared/libraries/utils/logger';
import { redis } from '../connections/redis-connection';

const RateLimitConfig = z.object({
  windowMs: z.number().default(60000),
  max: z.number().default(100),
  keyPrefix: z.string().default('rate-limit:'),
});

export class ApiGateway {
  /**
   * Check Rate Limit
   * @private
   * @param key - key
   * @param config - rate limit config
   */
  private static async checkRateLimit(key: string, config: z.infer<typeof RateLimitConfig>): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    /** remove old requests */
    await redis.zremrangebyscore(key, 0, windowStart);

    /** count the requests in current window */
    const requestCount = await redis.zcard(key);

    if (requestCount >= config.max) return false;

    /** add current request */
    await redis.zadd(key, now, now.toString());

    return true;
  }

  /**
   * ApiGateway Rate Limit
   * @param config - rate limit config
   */
  static rateLimit(config: z.infer<typeof RateLimitConfig>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const validated = RateLimitConfig.parse(config);
        const key = `${validated.keyPrefix}${req.ip}`;

        const allowed = await ApiGateway.checkRateLimit(key, validated);
        if (!allowed) {
          logger.warning(`Rate Limit Exceeded for IP: ${req.ip}`);
          return res.status(429).json({ error: 'Too many requests' });
        }

        next();
      } catch (error) {
        logger.error(`Rate Limit Error : ${error}`);
        next(error);
      }
    };
  }

  /**
   * ApiGateway Authenticate
   */
  static authenticate() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers['x-api-key'];

      if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
      }

      try {
        const isValid = await redis.get(`apiKey:${apiKey}`);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid API key' });
        }
        next();
      } catch (error) {
        logger.error(`Authentication error : ${error}`);
        next(error);
      }
    };
  }
}
