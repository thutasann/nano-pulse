// @ts-check
const { redisRateLimit } = require('../src/core/connections/redis-connection');
const { logger } = require('../src/shared/libraries/utils/logger');

/**
 * Setup Test API Key
 * @description - Setup test API key for local development
 * @author - [thuta](https://github.com/thutasann)
 * @version - 1.0.0
 */
async function setupTestApiKey() {
  const TEST_API_KEY = 'test-123';
  try {
    await redisRateLimit.set(`apiKey:${TEST_API_KEY}`, 'true');
    logger.success(`Test API key set successfully: ${TEST_API_KEY}`);
  } catch (error) {
    logger.error(`Failed to set test API key: ${error}`);
  } finally {
    process.exit(0);
  }
}
setupTestApiKey();
