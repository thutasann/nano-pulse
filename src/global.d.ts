declare namespace NodeJS {
  export interface ProcessEnv {
    // Application
    PORT: number;
    MONGO_URI: string;

    // Redis
    REDIS_HOST: string;
    REDIS_PORT: string;

    // Kafka
    KAFKA_BROKER: string;
    KAFKA_USE_SSL: 'true' | 'false';
    KAFKA_SASL_USERNAME: string;
    KAFKA_SASL_PASSWORD: string;

    // Discord
    DISCORD_WEBHOOK_URL: string;
  }
}
