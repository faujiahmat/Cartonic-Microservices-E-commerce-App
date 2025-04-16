import dotenv from 'dotenv';
import process from 'process';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 6006,
  dbUrl: process.env.MONGO_URI || 'mongodb://localhost:27017',
  dbName: process.env.MONGO_DBNAME || 'cartonic',
  jwtIssuer: process.env.JWT_ISSUER || 'jwt-issuer',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '1M',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  sentryDsn: process.env.SENTRY_DSN || 'https://examplePublicKey@o123456.ingest.sentry.io/9876543',
  authServiceApiKey: process.env.AUTH_SERVICE_API_KEY || 'auth-service-api-key',
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
};
