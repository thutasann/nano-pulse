import IORedis from 'ioredis';
import { getRedisUrl } from '../../../core/connections/redis-connection';

const redis_url = getRedisUrl();
const pub_client = new IORedis(redis_url);
const sub_client = new IORedis(redis_url);

/**
 * Redis Publish Event
 * @param channel - channel name
 * @param message - message to be published
 */
export async function redis_publish(channel: string, message: string): Promise<void> {
  await pub_client.publish(channel, message);
}

/**
 * Redis Subscribe
 * @param channel - channel name
 * @param callback - callback fn
 */
export function redis_subscribe(channel: string, callback: (message: string) => void): void {
  sub_client.subscribe(channel);
  sub_client.on('message', (chan, message) => {
    if (chan === channel) {
      callback(message);
    }
  });
}
