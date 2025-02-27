import kafka from '../../../core/connections/kafka-connection';
import { logger } from '../utils/logger';

const producer = kafka.producer();

/**
 * Initialize Kafka Producer
 */
export async function initialize_producer() {
  await producer.connect();
  logger.success('Kafka Producer connected');
}

/**
 * Kafka Producer Function
 * @param topic - topic name
 * @param message - message
 */
export async function kafka_produce(topic: string, message: string) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          value: message,
        },
      ],
    });
    logger.success(`[Kafka] Message Sent to topic ${topic} : ${message}`);
  } catch (error) {
    logger.error(`[Kafka]Failed to send message to Kafka topic ${topic} : ${error} `);
  }
}
