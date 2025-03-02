import { apiConfig } from './api-config.constants';
import { kafkaConstants } from './kafka.constants';
import { redisConstants } from './redis.constants';
import { webhokPriorityConstants } from './webhook-priority.constants';

/**
 * Application Constants
 * @description Application constants
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export const constants = {
  /**
   * Kafka Configuration
   */
  kafka: { ...kafkaConstants },
  /**
   * Webhook Configuration
   */
  redis: { ...redisConstants },
  /**
   * Webhook Priority Queue
   */
  webhookPriorityQueue: { ...webhokPriorityConstants },
  /**
   * API Configs
   */
  api: { ...apiConfig },
} as const;

export type AppConstants = typeof constants;
