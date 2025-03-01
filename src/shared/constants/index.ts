import { apiConfig } from './api-config.constants';

/**
 * Application Constants
 */
export const constants = {
  kafka: {
    clientId: 'webhook-system',
    groupId: 'webhook-group',
    topic: 'webhook-events',
    webhookRetry: 'webhook-retries',
    mediumPriorityTopic: 'webhook-medium-priority',
    lowPriorityTopic: 'webhook-low-priority',
  },
  redis: {
    channelName: 'example-channel',
  },
  webhook: {
    webhookQueue: 'webhook:events',
    webhookProcessingSet: 'webhook:processing',
  },
  webhookPriorityQueue: {
    high: 'webhook:queue:high',
    medium: 'webhook:queue:medium',
    low: 'webhook:queue:low',
  },
  api: { ...apiConfig },
} as const;

export type AppConstants = typeof constants;
