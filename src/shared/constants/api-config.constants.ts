/**
 * Api Config Constants
 * @description Constants for the API configuration
 */
export const apiConfig = {
  /**
   * Rate Limits
   */
  rateLimits: {
    /**
     * Webhook Rate Limit
     */
    webhook: {
      windowMs: 60000,
      max: 100,
      keyPrefix: 'rate-limit:webhook:',
    },
    /**
     * General Rate Limit
     */
    general: {
      windowMs: 60000,
      max: 200,
      keyPrefix: 'rate-limit:general:',
    },
  },
  /**
   * Routes
   */
  routes: {
    /**
     * Welcome Route
     */
    welcome: '/api/v1',
    /**
     * Webhook Route
     */
    webhook: '/api/v1/webhooks',
    /**
     * Events Route
     */
    events: '/api/v1/events',
  },
};
