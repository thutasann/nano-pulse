import { Kafka, logLevel } from 'kafkajs';
import { configuration } from '../../shared/config';
import { constants } from '../../shared/constants';
import { logger } from '../../shared/libraries/utils/logger';

const config = configuration();

/**
 * Kafka Client
 * @description Kafka Client for the application
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
const kafka = new Kafka({
  clientId: constants.kafka.clientId,
  brokers: [config.KAFKA_BROKER || 'localhost:9092'],
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 10,
    maxRetryTime: 30000,
    factor: 1.5,
  },
  logLevel: logLevel.ERROR,
});

/**
 * Kafka Producer
 * @description Producer Instance for sending messages
 */
const kafka_producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000,
});

kafka_producer.on('producer.connect', () => {
  logger.info('Kafka producer connected');
});

kafka_producer.on('producer.disconnect', () => {
  logger.warning('Kafka producer disconnected');
});

/**
 * Kafka Consumer
 * @description Consumer Instance for receiving messages
 */
const kafka_consumer = kafka.consumer({
  groupId: constants.kafka.consumerGroupId,
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxBytesPerPartition: 1048576, // 1MB
  retry: {
    initialRetryTime: 300,
    retries: 10,
    maxRetryTime: 30000,
    factor: 1.5,
  },
});

kafka_consumer.on('consumer.connect', () => {
  logger.info('Kafka consumer connected');
});

kafka_consumer.on('consumer.disconnect', () => {
  logger.warning('Kafka consumer disconnected');
});

kafka_consumer.on('consumer.crash', (error) => {
  logger.error(`Kafka consumer crashed: ${error}`);
});

/**
 * Verify Kafka Connection
 * @description Verify the Kafka connection
 * @returns {Promise<boolean>}
 */
const verify_kafka_connection = async (): Promise<boolean> => {
  const admin = kafka.admin();
  try {
    await admin.connect();
    const topics = await admin.listTopics();
    logger.success(`Kafka connection verified: ${topics}`);
    await admin.disconnect();
    return true;
  } catch (error) {
    logger.error(`Kafka connection verification failed: ${error}`);
    return false;
  }
};

export { kafka as default, kafka_consumer, kafka_producer, verify_kafka_connection };
