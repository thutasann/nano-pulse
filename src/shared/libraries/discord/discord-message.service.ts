import axios, { AxiosError } from 'axios';
import { DiscordMessageOptions, DiscordWebhookMessage } from '../../types/discord.type';
import { logger } from '../utils/logger';

/**
 * Discord Message Service
 * @description Service for sending messages to Discord webhooks
 * - Send Message
 * - Send Error Message
 * - Send Success Message
 * - Send Webhook Event Message
 * @todo Make Webhook_URL Dynamic from the Client for the future Dynamic Integrations
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
class DiscordMessageService {
  private static instance: DiscordMessageService;
  private readonly defaultRetryAttempts = 3;
  private readonly defaultRetryDelay = 1000;

  private constructor() {}

  public static getInstance(): DiscordMessageService {
    if (!DiscordMessageService.instance) {
      DiscordMessageService.instance = new DiscordMessageService();
    }
    return DiscordMessageService.instance;
  }

  /**
   * Send Message to Discord
   * @description Sends a message to Discord webhook with retry mechanism
   */
  public async sendMessage(message: DiscordWebhookMessage, options: DiscordMessageOptions): Promise<boolean> {
    const { webhookUrl, retryAttempts = this.defaultRetryAttempts, retryDelay = this.defaultRetryDelay } = options;

    let attempts = 0;

    while (attempts < retryAttempts) {
      try {
        await axios.post(webhookUrl, message, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        logger.success('Discord message sent successfully');
        return true;
      } catch (error) {
        attempts++;
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          logger.error(
            `Discord API Error (Attempt ${attempts}/${retryAttempts}): ${axiosError.response.status} - ${JSON.stringify(
              axiosError.response.data
            )}`
          );

          // Handle rate limiting
          if (axiosError.response.status === 429) {
            const retryAfter = parseInt(axiosError.response.headers['retry-after'] || '1000');
            await new Promise((resolve) => setTimeout(resolve, retryAfter));
            continue;
          }
        } else {
          logger.error(`Discord Message Error (Attempt ${attempts}/${retryAttempts}): ${error}`);
        }

        if (attempts < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    return false;
  }

  /**
   * Send Error Message
   * @description Sends an error message to Discord with stack trace
   */
  public async sendErrorMessage(error: Error, context: string, options: DiscordMessageOptions): Promise<boolean> {
    const message: DiscordWebhookMessage = {
      embeds: [
        {
          title: '❌ Error Alert',
          color: 0xff0000, // Red
          fields: [
            {
              name: 'Context',
              value: context,
            },
            {
              name: 'Error Message',
              value: error.message,
            },
            {
              name: 'Stack Trace',
              value: `\`\`\`${error.stack?.slice(0, 1000) || 'No stack trace'}\`\`\``,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Webhook System Error',
          },
        },
      ],
    };

    return this.sendMessage(message, options);
  }

  /**
   * Send Success Message
   * @description Sends a success message to Discord
   */
  public async sendSuccessMessage(
    title: string,
    description: string,
    options: DiscordMessageOptions
  ): Promise<boolean> {
    const message: DiscordWebhookMessage = {
      embeds: [
        {
          title: `✅ ${title}`,
          description,
          color: 0x00ff00, // Green
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Webhook System Success',
          },
        },
      ],
    };

    return this.sendMessage(message, options);
  }

  /**
   * Send Webhook Event Message
   * @description Sends a webhook event message to Discord
   */
  public async sendWebhookEventMessage(
    eventType: string,
    payload: Record<string, any>,
    options: DiscordMessageOptions
  ): Promise<boolean> {
    const message: DiscordWebhookMessage = {
      embeds: [
        {
          title: '🔔 Webhook Event',
          color: 0x0099ff, // Blue
          fields: [
            {
              name: 'Event Type',
              value: eventType,
              inline: true,
            },
            {
              name: 'Timestamp',
              value: new Date().toISOString(),
              inline: true,
            },
            {
              name: 'Payload',
              value: `\`\`\`json\n${JSON.stringify(payload, null, 2)}\`\`\``,
            },
          ],
          footer: {
            text: 'Webhook System Event',
          },
        },
      ],
    };

    return this.sendMessage(message, options);
  }
}

/**
 * Discord Message Service Singleton Instance
 * @description Singleton instance of the Discord Message Service
 */
export const discordMessageService = DiscordMessageService.getInstance();
