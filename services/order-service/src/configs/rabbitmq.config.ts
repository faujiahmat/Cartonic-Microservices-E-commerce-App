import amqp from 'amqplib';
import logger from '../utils/winston';
import { config } from './config';
import Sentry from '../utils/sentry';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

export async function startRabbitMQ() {
  if (channel) return; // Mencegah pembuatan koneksi ganda

  try {
    connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel(); // Pastikan ini dibuat dari connection

    await channel.assertQueue('payment_status_update', { durable: true });
    await channel.assertQueue('order_payment', { durable: true });
    await channel.assertQueue('payment_notification', { durable: true });
    await channel.assertQueue('order_expired', { durable: true });

    logger.info('✅ RabbitMQ connection established');

    // Tangani koneksi yang tiba-tiba terputus
    connection.on('close', async () => {
      logger.warn('⚠️ RabbitMQ connection closed. Reconnecting...');
      await reconnectRabbitMQ();
    });

    connection.on('error', async (err) => {
      logger.error('❌ RabbitMQ connection error:', err);
      await reconnectRabbitMQ();
    });
  } catch (error: unknown) {
    Sentry.captureException(error);
    logger.error('❌ Failed to connect to RabbitMQ:', (error as Error).message);
    process.exit(1);
  }
}

async function reconnectRabbitMQ() {
  await closeRabbitMQ();
  setTimeout(startRabbitMQ, 5000); // Coba reconnect setelah 5 detik
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
