import { Decimal } from '@prisma/client/runtime/library';
import { PaymentService } from '../services/payment.service';
import axios from 'axios';
import { Status } from '@prisma/client';
import amqp from 'amqplib';
import { config } from '../configs/config';
import logger from '../utils/winston';
import Sentry from '../utils/sentry';

export const consumePaymentRequests = async () => {
  const connection = await amqp.connect(config.rabbitmqUrl);
  const channel = await connection.createChannel();

  channel.consume('order_payment', async (msg) => {
    if (msg) {
      const orderData = JSON.parse(msg.content.toString());
      logger.info('Received order data : ' + JSON.stringify(orderData));

      const { orderId, userId, orderItems } = orderData;
      try {
        // Ambil harga produk dari ProductService
        let totalAmount = 0;
        for (const item of orderItems) {
          const product = await axios.get(`${config.productServiceUrl}/${item.productId}`);
          if (!product) {
            logger.warn(`Product not found: ${item.productId.data}`);
            continue;
          }
          totalAmount += product.data.data.price * item.quantity;
        }

        // Data untuk createPayment
        const paymentData = {
          userId: userId as string,
          orderId: orderId as string,
          amount: new Decimal(totalAmount),
          status: Status.PENDING,
          paymentMethod: 'CREDIT_CARD',
        };

        const payment = await PaymentService.createPayment(paymentData);

        logger.info('Payment created: ' + JSON.stringify(payment));

        // Kirim event ke notification-service
        channel.sendToQueue(
          'payment_notification',
          Buffer.from(
            JSON.stringify({
              paymentId: payment.id,
              userId: payment.userId,
              status: payment.status,
              amount: payment.amount,
            }),
          ),
          { persistent: true },
        );

        logger.info('Payment event sent to notification service');

        setTimeout(
          async () => {
            const updatedPayment = await PaymentService.getPaymentById(payment.id);
            if (updatedPayment?.status === Status.PENDING) {
              logger.info(`⏳ Payment ${payment.id} expired, sending to order_expired`);
              channel.sendToQueue('order_expired', Buffer.from(JSON.stringify({ orderId })), {
                persistent: true,
              });
            }
          },
          10 * 60 * 1000,
        );
      } catch (error) {
        Sentry.captureException(error);
        logger.error('Error processing payment: ' + error);

        channel.sendToQueue('order_expired', Buffer.from(JSON.stringify({ orderId })), {
          persistent: true,
        });
      }

      channel.ack(msg);
    }
  });
};
