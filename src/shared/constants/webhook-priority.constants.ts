/**
 * Webhook Priority Constants
 * - High Priority: Redis
 * - Medium Priority: Kafka
 * - Low Priority: Kafka
 */
export const webhokPriorityConstants = {
  /**
   * Redis High Priority Queue
   */
  high: 'webhook:queue:high',
  /**
   * Kafka Medium Priority Topic
   */
  medium: 'webhook-medium-priority',
  /**
   * Kafka Low Priority Topic
   */
  low: 'webhook-low-priority',
};
