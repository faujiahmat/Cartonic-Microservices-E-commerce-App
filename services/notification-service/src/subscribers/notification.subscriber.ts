import { channel } from '../configs/rabbitmq';
import Sentry from '../utils/sentry';
import logger from '../utils/winston';

export const consumePaymentNotifications = async () => {
  try {
    const getChanel = channel;
    await getChanel?.assertQueue('payment_notification', { durable: true });

    logger.info('Listening for payment notifications...');

    getChanel?.consume('payment_notification', (msg) => {
      if (msg) {
        const notification = JSON.parse(msg.content.toString());

        logger.info('Received payment notification: ' + JSON.stringify(notification));

        // Simulasi mengirim email/SMS notifikasi
        logger.info(
          `📩 Sending notification to user ${notification.userId}: Payment ${notification.status} for ${notification.amount}`,
        );

        getChanel.ack(msg);
      }
    });
  } catch (error: Error | unknown) {
    Sentry.captureException(error);
    logger.error('❌ Failed to consume payment updates:', (error as Error).message);
  }
};
