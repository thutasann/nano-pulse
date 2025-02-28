/**
 * Application Constants
 */
export const constants = {
  kafka: {
    clientId: 'webhook-system',
    groupId: 'webhook-consumers',
    topic: 'webhook-events',
    webhookRetry: 'webhook-retry',
  },
  redis: {
    channelName: 'example-channel',
  },
  webhook: {
    webhookQueue: 'webhook:events',
    webhookProcessingSet: 'webhook:processing',
  },
} as const;

export type AppConstants = typeof constants;
