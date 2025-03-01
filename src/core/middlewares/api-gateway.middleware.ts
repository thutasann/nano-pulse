import { z } from 'zod';
import { logger } from '../../shared/libraries/utils/logger';
import { ResponseHandler } from '../../shared/libraries/utils/response-handler.util';
import { redisRateLimit } from '../connections/redis-connection';

const RateLimitConfig = z.object({
  windowMs: z.number().default(60000),
  max: z.number().default(100),
  keyPrefix: z.string().default('rate-limit:'),
});

/**
 * Api Gateway Middleware
 * @description This middleware is used to check the rate limit and authenticate the request.
 * - Check the rate limit for the request
 * - If the rate limit is exceeded, return a 429 error
 * - Authenticate the request
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export class ApiGateway {
  /**
   * Check Rate Limit
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
   * @description This middleware is used to rate limit the requests.
   * - Check the rate limit for the request
   * - If the rate limit is exceeded, return a 429 error
   * @param config - rate limit config
   */
  static rateLimit(config: z.infer<typeof RateLimitConfig>) {
    return async (req: any, res: any, next: any) => {
      try {
        const validated = RateLimitConfig.parse(config);
        const key = `${validated.keyPrefix}${req.ip}`;

        const allowed = await ApiGateway.checkRateLimit(key, validated);
        if (!allowed) {
          ResponseHandler.tooManyRequests(res, `Rate limit exceeded for IP: ${req.ip}`);
          return;
        }

        next();
      } catch (error) {
        logger.error(`Rate Limit Error : ${error}`);
        return;
      }
    };
  }

  /**
   * ApiGateway Authenticate
   * @description This middleware is used to authenticate the request.
   */
  static authenticate() {
    return async (req: any, res: any, next: any) => {
      const apiKey = req.headers['x-api-key']; // test-123

      if (!apiKey) {
        ResponseHandler.unauthorized(res, 'API key required');
        return;
      }

      req.client = {
        apiKey: apiKey,
      };

      try {
        const isValid = await redisRateLimit.get(`apiKey:${apiKey}`);
        if (!isValid) {
          ResponseHandler.unauthorized(res, 'Invalid API key');
          return;
        }

        next();
      } catch (error) {
        ResponseHandler.error(res, 'Authentication error', 500, error);
        return;
      }
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      /**
       * Request Client
       */
      client?: {
        /**
         * Client ID
         */
        clientId: string;
        /**
         * API Key
         */
        apiKey: string;
      };
    }
  }
}
