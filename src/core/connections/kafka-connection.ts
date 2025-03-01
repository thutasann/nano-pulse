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
  // ssl: config.KAFKA_USE_SSL ? { rejectUnauthorized: false } : undefined,
  // sasl:
  //   config.KAFKA_SASL_USERNAME && config.KAFKA_SASL_PASSWORD
  //     ? {
  //         mechanism: 'plain',
  //         username: config.KAFKA_SASL_USERNAME,
  //         password: config.KAFKA_SASL_PASSWORD,
  //       }
  //     : undefined,
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
 * Verify Kafka Connection
 * @description Verify the Kafka connection
 * @returns {Promise<boolean>}
 */
const verifyConnection = async () => {
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

export { kafka as default, verifyConnection };
