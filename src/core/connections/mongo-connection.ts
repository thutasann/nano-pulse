import mongoose from 'mongoose';
import { logger } from '../../shared/libraries/utils/logger';

/**
 * MongoDB Connection
 * @description This function is used to connect to the MongoDB database.
 */
export async function connectDB() {
  try {
    await mongoose.connect(process.env['MONGO_URI'] as string);
    logger.success('MongoDB Connected');
  } catch (error) {
    logger.error(`Failed to connect to MongoDB ${error}`);
    process.exit(1);
  }
}
