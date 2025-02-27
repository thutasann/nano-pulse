declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    MONGO_URI: string;

    REDIS_HOST: string;
    REDIS_PORT: string;
  }
}
