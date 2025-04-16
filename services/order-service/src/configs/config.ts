import dotenv from 'dotenv';
import process from 'process';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  dbUrl: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/dbname',
  jwtIssuer: process.env.JWT_ISSUER || 'jwt-issuer',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  port: process.env.PORT || 6005,
  orderServiceApiKey: process.env.ORDER_SERVICE_API_KEY,
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
  productUrl: process.env.PRODUCT_URL || 'http://product-service:6001/products',
  sentryDsn: process.env.SENTRY_DSN || 'https://examplePublicKey@o123456.ingest.sentry.io/9876543',
};
