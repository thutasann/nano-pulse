/**
 * Application Constants
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
   * Redis Configuration
   */
  redis: {
    /**
     * Redis Channel Name
     */
    channelName: 'example-channel',
  },
  /**
   * Webhook Configuration
   */
  webhook: {
    /**
     * Webhook Queue
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
     * High Priority Queue
     */
    high: 'webhook:queue:high',
    /**
     * Medium Priority Queue
     */
    medium: 'webhook:queue:medium',
    /**
     * Low Priority Queue
     */
    low: 'webhook:queue:low',
  },
} as const;

export type AppConstants = typeof constants;
