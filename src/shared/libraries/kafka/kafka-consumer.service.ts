import kafka from '../../../core/connections/kafka-connection';
import { constants } from '../../constants/app.constants';
import { logger } from '../utils/logger';

const consumer = kafka.consumer({ groupId: constants.kafka.groupId });

/**
 * Initialize Kafka Consumer
 * @param topic - topic name
 */
export const initialize_consumer = async (topic: string) => {
  await consumer.connect();
  logger.success('Kafka Consumer connected');

  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      logger.info(`[Kafka] Received message: ${message.value?.toString()} on topic: ${topic}`);

      /** @todo Add  message processing logic here */
    },
  });
};
