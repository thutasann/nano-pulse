import { apiConfig } from './api-config.constants';

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
  api: { ...apiConfig },
} as const;

export type AppConstants = typeof constants;
