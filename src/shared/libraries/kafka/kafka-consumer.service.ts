import kafka from '../../../core/connections/kafka-connection';
import { constants } from '../../constants';
import { logger } from '../utils/logger';

const consumer = kafka.consumer({ groupId: constants.kafka.groupId });

/**
 * Initialize Kafka Consumer
 * @description Initialize Kafka consumer with kafka connection
 * @param topic - topic name
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
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
