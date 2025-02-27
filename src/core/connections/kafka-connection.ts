import { Kafka, logLevel } from 'kafkajs';
import { configuration } from '../../shared/config';
import { constants } from '../../shared/constants/app.constants';

const config = configuration();

/**
 * Kafka Client
 */
const kafka = new Kafka({
  clientId: constants.kafka.clientId,
  brokers: [config.KAFKA_BROKER || 'localhost:9092'],
  ssl: config.KAFKA_USE_SSL ? { rejectUnauthorized: false } : undefined,
  sasl:
    config.KAFKA_SASL_USERNAME && config.KAFKA_SASL_PASSWORD
      ? {
          mechanism: 'plain',
          username: config.KAFKA_SASL_USERNAME,
          password: config.KAFKA_SASL_PASSWORD,
        }
      : undefined,
  connectionTimeout: 3000,
  requestTimeout: 5000,
  retry: {
    initialRetryTime: 100,
    retries: 3,
  },
  logLevel: logLevel.INFO,
});

export default kafka;
