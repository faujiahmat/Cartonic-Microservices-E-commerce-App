import amqp from 'amqplib';
import logger from '../utils/winston';
import Sentry from '../utils/sentry';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL;

export const connectRabbitMQ = async () => {
  if (channel) return;

  try {
    connection = await amqp.connect(RABBITMQ_URL as string);
    channel = await connection.createChannel();
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
  } catch (error) {
    Sentry.captureException(error);
    logger.error('❌ Failed to connect to RabbitMQ:', (error as Error).message);
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
    logger.error('❌ Error closing RabbitMQ:' + (error as Error).message);
  }
}

export { channel };
