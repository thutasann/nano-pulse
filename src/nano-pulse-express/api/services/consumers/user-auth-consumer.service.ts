import { kafka_consumer } from '../../../core/connections/kafka-connection';
import { configuration } from '../../../shared/config';
import { constants } from '../../../shared/constants';
import { discordMessageService } from '../../../shared/libraries/discord/discord-message.service';
import { socket } from '../../../shared/libraries/socket/socket.service';
import { logger } from '../../../shared/libraries/utils/logger';
import { UserAuth } from '../../../shared/types/user-auth/user-auth.type';

/**
 * User Auth Consumer Service
 * @description - Consume user authentication events from Kafka
 * - Process user login/registration events
 * - Emit events to connected clients via Socket.IO
 * @author - [thuta](https://github.com/thutasann)
 * @version - 1.0.0
 */
export class UserAuthConsumerService {
  private static instance: UserAuthConsumerService;
  private readonly USER_AUTH_TOPIC = constants.userAuth.topic;
  private readonly DISCORD_WEBHOOK_URL = configuration().DISCORD_WEBHOOK_URL;

  private constructor() {
    this.initializeConsumers();
  }

  public static getInstance(): UserAuthConsumerService {
    if (!UserAuthConsumerService.instance) {
      UserAuthConsumerService.instance = new UserAuthConsumerService();
    }
    return UserAuthConsumerService.instance;
  }

  private async initializeConsumers() {
    try {
      await this.initializeKafkaConsumers();
    } catch (error) {
      logger.error(`User Auth Consumer Service initialization Failed : ${error}`);
    }
  }

  private async initializeKafkaConsumers() {
    try {
      const consumer = kafka_consumer;

      await consumer.subscribe({
        topics: [this.USER_AUTH_TOPIC],
        fromBeginning: true,
      });

      await consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;
          const authEvent: UserAuth.UserAuthEvent = JSON.parse(message.value.toString());
          await this.processAuthEvent(authEvent);
        },
      });

      logger.success('User Auth Kafka Consumer Initialized Successfully');
    } catch (error) {
      logger.error(`Failed to initialize User Auth Kafka Consumer : ${error}`);
      throw error;
    }
  }

  /**
   * Process Auth Event
   * @param authEvent - User Auth Event
   */
  private async processAuthEvent(authEvent: UserAuth.UserAuthEvent) {
    logger.info(`Processing auth event : ${authEvent.eventType}`);

    socket.emitToAll('userAuthEvent', {
      eventType: authEvent.eventType,
      userId: authEvent.userId,
      email: authEvent.email,
      firstName: authEvent.firstName,
      lastName: authEvent.lastName,
      timestamp: authEvent.timestamp,
    });

    // Send Discord notification if configured
    if (this.DISCORD_WEBHOOK_URL) {
      await discordMessageService.sendSuccessMessage(
        'User Login',
        `User ${authEvent.firstName} ${authEvent.lastName} (${authEvent.email}) logged in successfully`,
        {
          webhookUrl: this.DISCORD_WEBHOOK_URL,
        }
      );
    }
  }

  /**
   * Kafka Consumer Service Shutdown
   */
  public async shutdown() {
    try {
      await kafka_consumer.disconnect();
      logger.info('User Auth consumer service shut down successfully');
    } catch (error) {
      logger.error(`Error shutting down User Auth consumer: ${error}`);
    }
  }
}
