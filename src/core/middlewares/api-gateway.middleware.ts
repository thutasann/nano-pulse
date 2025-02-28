import { z } from 'zod';
import { logger } from '../../shared/libraries/utils/logger';
import { redisRateLimit } from '../connections/redis-connection';

const RateLimitConfig = z.object({
  windowMs: z.number().default(60000),
  max: z.number().default(100),
  keyPrefix: z.string().default('rate-limit:'),
});

/**
 * Api Gateway Middleware
 * @description This middleware is used to check the rate limit and authenticate the request.
 */
export class ApiGateway {
  /**
   * Check Rate Limit
   * @private
   * @param key - key
   * @param config - rate limit config
   */
  private static async checkRateLimit(key: string, config: z.infer<typeof RateLimitConfig>): Promise<boolean> {
    try {
      const now = Date.now();
      const windowStart = now - config.windowMs;

      /** remove old requests */
      await redisRateLimit.zremrangebyscore(key, 0, windowStart);

      /** count the requests in current window */
      const requestCount = await redisRateLimit.zcard(key);

      if (requestCount >= config.max) return false;

      /** add current request */
      await redisRateLimit.zadd(key, now, now.toString());

      return true;
    } catch (error) {
      logger.error(`Rate limit check error: ${error}`);
      return true;
    }
  }

  /**
   * ApiGateway Rate Limit
   * @param config - rate limit config
   */
  static rateLimit(config: z.infer<typeof RateLimitConfig>) {
    return async (req: any, res: any, next: any) => {
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
        next();
      }
    };
  }

  /**
   * ApiGateway Authenticate
   */
  static authenticate() {
    return async (req: any, res: any, next: any) => {
      const apiKey = req.headers['x-api-key'];

      if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
      }

      try {
        const isValid = await redisRateLimit.get(`apiKey:${apiKey}`);
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
