import dotenv from 'dotenv';
dotenv.config();

export const configuration = () => {
  return {
    PORT: process.env['PORT'],
    MONGO_URI: process.env['MONGO_URI'],

    REDIS_HOST: process.env['REDIS_HOST'],
    REDIS_PORT: parseInt(process.env['REDIS_PORT'] || '6379'),
  };
};

export type Configuration = typeof configuration;
