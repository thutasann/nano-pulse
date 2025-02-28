import { redisRateLimit } from '../core/connections/redis-connection';
import { logger } from '../shared/libraries/utils/logger';

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
