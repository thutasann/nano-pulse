import kafka from '../../../core/connections/kafka-connection';
import { logger } from '../utils/logger';

const producer = kafka.producer();

/**
 * Initialize Kafka Producer
 * @description Initialize Kafka producer with kafka connection
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export async function initialize_kafka_producer() {
  await producer.connect();
  logger.success('Kafka Producer connected');
}

/**
 * Kafka Producer Function
 * @description Produce message to Kafka topic
 * @param topic - topic name
 * @param message - message
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
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
    logger.error(`[Kafka] Failed to send message to Kafka topic ${topic} : ${error} `);
  }
}

/**
 * Shutdown Kafka Producer
 * @description Shutdown Kafka producer
 * @author [thutasann](https://github.com/thutasann)
 * @version 1.0.0
 */
export async function shutdown_kafka_producer() {
  await producer.disconnect();
  logger.success('Kafka Producer disconnected');
}
