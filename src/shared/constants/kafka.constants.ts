/**
 * Kafka Constants
 */
export const kafkaConstants = {
  /**
   * Kafka Client ID
   */
  clientId: 'webhook-system',
  /**
   * Kafka Consumer Group ID
   */
  consumerGroupId: 'webhook-consumer-group',
  /**
   * Kafka Topic
   */
  topic: 'webhook-events',
  /**
   * Kafka High Priority Topic
   */
  highPriorityTopic: 'webhook-high-priority',
  /**
   * Kafka Retry Topic
   */
  /**
   * Kafka Medium Priority Topic
   */
  mediumPriorityTopic: 'webhook-medium-priority',
  /**
   * Kafka Low Priority Topic
   */
  lowPriorityTopic: 'webhook-low-priority',
  /**
   * Kafka Webhook Retry Topic
   */
  webhookRetry: 'webhook-retries',
};
