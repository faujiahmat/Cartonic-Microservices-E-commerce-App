import Redis from 'ioredis';
import { config } from './config';
import logger from '../utils/winston';

const redis = new Redis({
  host: config.redisHost,
  port: Number(config.redisPort),
});

redis.on('connect', () => logger.info('🟢 Redis connected'));
redis.on('error', (err) => logger.error('🔴 Redis connection error: ', err));

export default redis;
