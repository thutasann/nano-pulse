import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app.module';
import { connectDB } from './core/connections/mongo-connection';
import { initialize_socket } from './core/initializers/socket/socket.initializer';
import { WebhookInitializer } from './core/initializers/webhook/webhooks.initializer';
import { configuration } from './shared/config';
import { constants } from './shared/constants';
import { initialize_kafka_producer } from './shared/libraries/kafka/kafka-producer.service';
import { redis_subscribe } from './shared/libraries/redis/pubsub.service';
import { logger } from './shared/libraries/utils/logger';

/**
 * NanoPulse Application
 * @description This system will handle real-time data processing for:
 * - User Activity Tracking (logins, actions, interactions)
 * - Notifications (instant alerts, scheduled updates)
 * - Awards System (dynamic rankings based on real-time events)
 * - Analytics System (detailed event monitoring and reports)
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
class NanoPulseApplication {
  private static instance: NanoPulseApplication;
  private readonly PORT = configuration().PORT;
  private httpServer = createServer(app);
  private webhookInitializer = WebhookInitializer.getInstance();

  private constructor() {}

  /**
   * Get NanoPulse Application Instance
   * @description Get the singleton instance of the NanoPulseApplication
   */
  static getInstance(): NanoPulseApplication {
    if (!NanoPulseApplication.instance) {
      NanoPulseApplication.instance = new NanoPulseApplication();
    }
    return NanoPulseApplication.instance;
  }

  /**
   * Initialize Database
   */
  private async initializeDB(): Promise<void> {
    try {
      mongoose.set('maxTimeMS', 5000);
      await connectDB();
    } catch (error) {
      logger.error(`Database connection failed: ${error}`);
      throw error;
    }
  }

  /**
   * Initialize Message Systems
   */
  private async initializeMessageSystems(): Promise<void> {
    try {
      await initialize_kafka_producer();

      setTimeout(() => {
        redis_subscribe(constants.redis.channelName, (message) => {
          logger.info(`Received message on example-channel: ${message}`);
        });
      }, 1000);
    } catch (error) {
      logger.error(`Message systems initialization failed: ${error}`);
      throw error;
    }
  }

  /**
   * Initialize Core Services
   */
  private async bootstrap(): Promise<void> {
    const startTime = Date.now();
    logger.info('Bootstrapping core services...');

    try {
      await this.initializeDB();

      await Promise.all([this.initializeMessageSystems(), initialize_socket(this.httpServer)]);

      setTimeout(() => {
        this.webhookInitializer.initialize().catch((error) => {
          logger.error(`Webhook initialization failed: ${error}`);
        });
      }, 2000);

      const initTime = Date.now() - startTime;
      logger.success(`Core services initialized (${initTime}ms)`);
    } catch (error) {
      logger.error(`Bootstrap failed: ${error}`);
      throw error;
    }
  }

  /**
   * Setup Graceful Shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down...`);
      try {
        await Promise.allSettled([
          mongoose.connection.close(),
          this.webhookInitializer.shutdown(),
          new Promise((resolve) => this.httpServer.close(resolve)),
        ]);
        process.exit(0);
      } catch (error) {
        logger.error(`Shutdown error: ${error}`);
        process.exit(1);
      }
    };

    // Essential error handlers only
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught Exception: ${error}`);
      shutdown('UNCAUGHT_EXCEPTION');
    });
  }

  /**
   * Start Application
   * @description Start the NanoPulse application
   * - Bootstrap the application
   * - Start the HTTP server
   * - Setup graceful shutdown
   */
  async main(): Promise<void> {
    try {
      const startTime = Date.now();

      this.setupGracefulShutdown();

      await this.bootstrap();

      this.httpServer.listen(this.PORT, () => {
        logger.success(`Server is running on port http://localhost:${this.PORT}/api/v1`);
      });

      const bootTime = Date.now() - startTime;
      logger.success(`Nano Pulse initialized 🚀 (${bootTime}ms)`);
    } catch (error) {
      logger.error(`Startup failed: ${error}`);
      process.exit(1);
    }
  }
}

NanoPulseApplication.getInstance().main();
