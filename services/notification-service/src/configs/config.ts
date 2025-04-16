import dotenv from 'dotenv';
import process from 'process';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 6004,
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  sentryDsn: process.env.SENTRY_DSN,
};
