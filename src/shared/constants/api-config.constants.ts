/**
 * Api Config Constants
 * @description Constants for the API configuration
 */
export const apiConfig = {
  rateLimits: {
    webhook: {
      windowMs: 60000,
      max: 100,
      keyPrefix: 'rate-limit:webhook:',
    },
    general: {
      windowMs: 60000,
      max: 200,
      keyPrefix: 'rate-limit:general:',
    },
  },
  routes: {
    welcome: '/api/v1',
    webhook: '/api/v1/webhooks',
    events: '/api/v1/events',
  },
};
