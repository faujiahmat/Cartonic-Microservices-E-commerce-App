import mongoose from 'mongoose';
import Sentry from '../utils/sentry';
import logger from '../utils/winston';
import { config } from '../configs/config';

const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUrl as string, {
      dbName: config.dbName,
    });
    logger.info('✅ MongoDB Connected');
  } catch (error) {
    Sentry.captureException(error);
    logger.error('❌ MongoDB Connection Error: ' + (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;
