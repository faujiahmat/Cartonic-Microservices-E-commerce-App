import { OrderStatus } from '@prisma/client';
import { OrderService } from '../services/order.service';
import { config } from '../configs/config';
import amqp from 'amqplib';
import logger from '../utils/winston';
import Sentry from '../utils/sentry';

export const consumePaymentUpdates = async () => {
  try {
    const connection = await amqp.connect(config.rabbitmqUrl);

    const channel = await connection.createChannel();

    channel.consume('payment_status_update', async (msg) => {
      if (msg) {
        const paymentUpdate = JSON.parse(msg.content.toString());
        logger.info('Received payment update:', paymentUpdate);

        const { orderId, status } = paymentUpdate;

        logger.info(`Updating order ${orderId} to status: ${status}`);

        // Update status order di database
        const order = await OrderService.updateOrderStatus(orderId, status as OrderStatus);

        if (!order) {
          logger.warn(`Order not found: ${orderId}`);
          channel.ack(msg);
          return;
        }

        if (status === 'CANCELED') {
          await OrderService.restoreStock(orderId, channel, msg);

          await OrderService.deleteOrder(orderId);
        }

        logger.info(`Order ${orderId} updated to status: ${status}`);
        channel.ack(msg);
      }
    });
  } catch (error: Error | unknown) {
    Sentry.captureException(error);
    logger.error('❌ Failed to consume payment updates:', (error as Error).message);
  }
};

export const processExpiredOrders = async () => {
  try {
    const connection = await amqp.connect(config.rabbitmqUrl);

    const channel = await connection.createChannel();

    channel.consume('order_expired', async (msg) => {
      if (!msg) return;

      const { orderId } = JSON.parse(msg.content.toString());

      const existingOrder = await OrderService.getOrderById(orderId);
      if (!existingOrder) {
        logger.warn(`Order not found: ${orderId}`);
        channel.ack(msg);
        return;
      }

      // Batalkan order di database
      await OrderService.updateOrderStatus(orderId, 'CANCELED');

      await OrderService.restoreStock(orderId, channel, msg);

      logger.info(`Order ${orderId} has been canceled due to no payment.`);

      channel.ack(msg); // Konfirmasi pesan sudah diproses
    });
  } catch (error) {
    Sentry.captureException(error);
    logger.error('❌ Failed to process expired orders:', error);
  }
};
