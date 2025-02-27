import dotenv from 'dotenv';
dotenv.config();

export const configuration = () => {
  return {
    // Application
    PORT: process.env['PORT'],
    MONGO_URI: process.env['MONGO_URI'],

    // Redis
    REDIS_HOST: process.env['REDIS_HOST'],
    REDIS_PORT: parseInt(process.env['REDIS_PORT'] || '6379'),

    // Kafka
    KAFKA_BROKER: process.env['KAFKA_BROKER'],
    KAFKA_USE_SSL: process.env['KAFKA_USE_SSL'] === 'true',
    KAFKA_SASL_USERNAME: process.env['KAFKA_SASL_USERNAME'] || null,
    KAFKA_SASL_PASSWORD: process.env['KAFKA_SASL_PASSWORD'] || null,
  };
};

export type Configuration = typeof configuration;
