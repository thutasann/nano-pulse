import { apiConfig } from './api-config.constants';
import { kafkaConstants } from './kafka.constants';
import { webhokPriorityConstants } from './webhook-priority.constants';
import { webhookConstants } from './webhook.constants';

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
  webhook: { ...webhookConstants },
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
