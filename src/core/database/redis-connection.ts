import { Redis, RedisOptions } from 'ioredis';
import { configuration } from '../config';
import { logger } from '../utils/logger';

/** Get Redis Client @private */
const redisClient = (): RedisOptions => {
  if (configuration().REDIS_HOST && configuration().REDIS_PORT) {
    return {
      host: configuration().REDIS_HOST,
      port: configuration().REDIS_PORT,
    };
  }
  throw new Error('Redis connection failed');
};

/**
 * Redis Instance
 * @example
 * redis.set('key', 'value')
 * redis.get('key')
 * redis.del('key')
 * redis.quit()
 */
const redis = new Redis(redisClient());

redis.on('error', (error) => {
  logger.error(`Redis connection error : ${error.message}`);
});

redis.on('connect', () => {
  logger.success('Redis connected successfully 🚀');
});

redis.on('ready', () => {
  logger.success('Redis is ready to accept commands');
});

redis.on('close', () => {
  logger.warning('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.warning('Redis attempting to reconnect...');
});

const gracefulShutdown = async () => {
  try {
    await redis.quit();
    logger.debug('Redis connection closed gracefully');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during Redis shutdown: ${error}`);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/** Get Redis URL */
export const getRedisUrl = (): string => {
  return `redis://${redisClient().host}:${redisClient().port}`;
};

export { redis };
