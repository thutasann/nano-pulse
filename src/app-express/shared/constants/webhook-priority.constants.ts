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
  high: 'webhook_queue_high',
  /**
   * Kafka Medium Priority Topic
   */
  medium: 'webhook_queue_medium',
  /**
   * Kafka Low Priority Topic
   */
  low: 'webhook_queue_low',
};
