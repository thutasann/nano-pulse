import { redis } from '../../../core/connections/redis-connection';
import { logger } from './logger';

export class ApiKeyManager {
  /**
   * Generate API Key
   */
  static generateApiKey(): string {
    return 'nano-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Create API Key
   */
  static async createApiKey(clientId: string): Promise<string> {
    try {
      const apiKey = this.generateApiKey();
      await redis.set(`apiKey:${apiKey}`, 'true');
      logger.success(`API Key created for client ${clientId}: ${apiKey}`);
      return apiKey;
    } catch (error) {
      logger.error(`Failed to create API key: ${error}`);
      throw error;
    }
  }

  /**
   * Revoke API Key
   */
  static async revokeApiKey(apiKey: string): Promise<void> {
    try {
      await redis.del(`apiKey:${apiKey}`);
      logger.success(`API Key revoked: ${apiKey}`);
    } catch (error) {
      logger.error(`Failed to revoke API key: ${error}`);
      throw error;
    }
  }

  /**
   * Validate API Key
   */
  static async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const isValid = await redis.get(`apiKey:${apiKey}`);
      return !!isValid;
    } catch (error) {
      logger.error(`Failed to validate API key: ${error}`);
      return false;
    }
  }
}
