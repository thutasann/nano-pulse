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
  kafka: {
    /**
     * Kafka Client ID
     */
    clientId: 'webhook-system',
    /**
     * Kafka Group ID
     */
    groupId: 'webhook-group',
    /**
     * Kafka Topic
     */
    topic: 'webhook-events',
    /**
     * Kafka Retry Topic
     */
    webhookRetry: 'webhook-retries',
    /**
     * Kafka Medium Priority Topic
     */
    mediumPriorityTopic: 'webhook-medium-priority',
    /**
     * Kafka Low Priority Topic
     */
    lowPriorityTopic: 'webhook-low-priority',
  },
  /**
   * Webhook Configuration
   */
  webhook: {
    /**
     * Webhook Events Queue
     */
    webhookQueue: 'webhook:events',
    /**
     * Webhook Processing Set
     */
    webhookProcessingSet: 'webhook:processing',
  },
  /**
   * Webhook Priority Queue
   */
  webhookPriorityQueue: {
    /**
     * Webhook High Priority Queue
     */
    high: 'webhook:queue:high',
    /**
     * Webhook Medium Priority Queue
     */
    medium: 'webhook:queue:medium',
    /**
     * Webhook Low Priority Queue
     */
    low: 'webhook:queue:low',
  },
} as const;

export type AppConstants = typeof constants;
