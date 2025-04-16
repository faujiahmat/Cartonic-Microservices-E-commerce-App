import amqp from 'amqplib';
import { config } from './config';
import logger from '../utils/winston';
import Sentry from '../utils/sentry';

let connection: amqp.ChannelModel | null = null;
const RABBITMQ_URL = config.rabbitmqUrl;

let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async () => {
  if (channel) return;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue('payment_notification', { durable: true });
    await channel.assertQueue('order_payment', {
      durable: true,
    });
    logger.info('✅ RabbitMQ connection established');

    connection.on('close', async () => {
      logger.warn('⚠️ RabbitMQ connection closed. Reconnecting...');
      await reconnectRabbitMQ();
    });
  } catch (error) {
    Sentry.captureException(error);
    logger.error('🔴 Failed to connect to RabbitMQ', error);
    process.exit(1);
  }
};

async function reconnectRabbitMQ() {
  await closeRabbitMQ();
  setTimeout(connectRabbitMQ, 5000); // Coba reconnect setelah 5 detik
}

export async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
      logger.info('✅ RabbitMQ channel closed');
    }

    if (connection) {
      await connection.close();
      connection = null;
      logger.info('✅ RabbitMQ connection closed');
    }
  } catch (error: unknown) {
    Sentry.captureException(error);
    logger.error('❌ Error closing RabbitMQ:', (error as Error).message);
  }
}

export { channel };
