import mongoose from 'mongoose';
import { config } from '../configs/config';
import logger from '../utils/winston';

const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUrl, {
      dbName: config.dbName,
    });
    logger.info('🟢MongoDB Connected');
  } catch (error) {
    logger.error('❌ MongoDB Connection Error: ' + error);
    process.exit(1);
  }
};

export default connectDB;
