import dotenv from 'dotenv';
import path from 'path';
import process from 'process';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 6002,
  jwtIssuer: process.env.JWT_ISSUER || 'jwt-issuer',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://user-service:6006/users',
  sentryDsn: process.env.SENTRY_DSN || 'https://examplePublicKey@o123456.ingest.sentry.io/9876543',
  authServiceApiKey: process.env.AUTH_SERVICE_API_KEY || 'auth-service-api-key',
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
};
