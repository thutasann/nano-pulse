import { createServer } from 'http';
import mongoose from 'mongoose';
import { WebhookConsumerService } from './api/services/webhook-consumer.service';
import app from './app.module';
import { connectDB } from './core/connections/mongo-connection';
import { initialize_socket } from './core/initializers/socket/socket.initializer';
import { WebhookInitializer } from './core/initializers/webhook/webhooks.initializer';
import { configuration } from './shared/config';
import { initialize_kafka_producer, shutdown_kafka_producer } from './shared/libraries/kafka/kafka-producer.service';
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
   * Setup Graceful Shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down...`);
      try {
        await Promise.allSettled([
          mongoose.connection.close(),
          new Promise((resolve) => this.httpServer.close(resolve)),
        ]);
        await shutdown_kafka_producer();
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
   * Initialize Mongodb Connection
   * @description Initialize Mongodb connection
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
   * Initialize Kafka Producer
   * @description Initialize Kafka producer Connection
   */
  private async initializeKafkaProducer(): Promise<void> {
    try {
      await initialize_kafka_producer();
    } catch (error) {
      logger.error(`Kafka Producer initialization failed: ${error}`);
      throw error;
    }
  }

  /**
   * Initialize Core Services
   * - Initialize Mongodb Connection
   * - Initialize Kafka Producer and Initialize Socket Parallelly
   * - Initialize Webhook Consumer Service
   * - Initialize Webhook Initializer after 2 seconds
   */
  private async bootstrap(): Promise<void> {
    const startTime = Date.now();
    logger.info('Bootstrapping core services...');

    try {
      await this.initializeDB();

      await Promise.all([this.initializeKafkaProducer(), initialize_socket(this.httpServer)]);

      WebhookConsumerService.getInstance();

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
   * Start Application
   * @description Start the NanoPulse application
   * - Setup graceful shutdown
   * - Bootstrap the application
   * - Start the HTTP server
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
      logger.success(`Nano Pulse Application initialized 🚀 (${bootTime}ms)`);
    } catch (error) {
      logger.error(`Startup failed: ${error}`);
      process.exit(1);
    }
  }
}

NanoPulseApplication.getInstance().main();
