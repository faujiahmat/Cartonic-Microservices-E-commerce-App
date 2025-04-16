import dotenv from 'dotenv';
import process from 'process';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 6001,
  dbUrl: process.env.MONGO_URI || 'mongodb://localhost:27017',
  dbName: process.env.MONGO_DBNAME || 'your-database-name',
  jwtIssuer: process.env.JWT_ISSUER || 'jwt-issuer',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 6379,
  redisTTL: process.env.REDIS_TTL || 300,
  orderServiceApiKey: process.env.ORDER_SERVICE_API_KEY,
  sentryDsn: process.env.SENTRY_DSN || 'https://examplePublicKey@o123456.ingest.sentry.io/9876543',
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
};
