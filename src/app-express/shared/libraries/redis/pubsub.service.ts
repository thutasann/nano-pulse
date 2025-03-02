import { redisPub, redisSub } from '../../../core/connections/redis-connection';
import { logger } from '../utils/logger';

/**
 * Redis Publish Event
 * @description Publish message to Redis channel
 * @param channel - channel name
 * @param message - message to be published
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export async function redis_publish(channel: string, message: string): Promise<void> {
  try {
    await redisPub.publish(channel, message);
  } catch (error) {
    logger.error(`Failed to publish message: ${error}`);
    throw error;
  }
}

/**
 * Redis Subscribe
 * @description Subscribe to Redis channel
 * @param channel - channel name
 * @param callback - callback fn
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export function redis_subscribe(channel: string, callback: (message: string) => void): void {
  redisSub.subscribe(channel);
  redisSub.on('message', (chan, message) => {
    if (chan === channel) {
      callback(message);
    }
  });
}
