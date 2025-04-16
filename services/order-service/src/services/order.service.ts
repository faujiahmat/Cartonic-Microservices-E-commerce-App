import amqp from 'amqplib';
import { PrismaClient, OrderStatus } from '@prisma/client';
import axios from 'axios';
import logger from '../utils/winston';
import { config } from '../configs/config';
import Sentry from '../utils/sentry';

const prisma = new PrismaClient();

const RABBITMQ_URL = config.rabbitmqUrl;

export class OrderService {
  static async createOrder(userId: string, items: { productId: string; quantity: number }[]) {
    const order = await prisma.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      channel.sendToQueue(
        'order_payment',
        Buffer.from(JSON.stringify({ orderId: order.id, userId, orderItems: items })),
        { persistent: true },
      );

      logger.info(`📢 order ${userId} send to order_payment queue`);

      return order;
    } catch (error) {
      Sentry.captureException(error);
      logger.error('❌ Failed to create order:', error);
      throw error;
    }
  }

  static async getOrderById(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
  }

  static getOrderByIdAndUser(userId: string, orderId: string) {
    return prisma.order.findUnique({
      where: { userId: userId, id: orderId },
      include: { orderItems: true },
    });
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  static async deleteOrder(orderId: string) {
    return await prisma.order.delete({ where: { id: orderId } });
  }

  static async restoreStock(orderId: string, channel: amqp.Channel, msg: amqp.Message) {
    const getOrder = await OrderService.getOrderById(orderId);

    if (!getOrder || !getOrder.orderItems) {
      logger.info('❌ Failed to restore stock for canceled order :' + JSON.stringify(orderId));
      channel.ack(msg);
      return;
    }

    try {
      const productRequests = getOrder.orderItems.map((item) =>
        axios.get(`${config.productUrl}/${item.productId}/stock`),
      );

      const stocks = await Promise.allSettled(productRequests);

      const stockMap = stocks
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<any>).value.data.data);

      const updateRequests = getOrder.orderItems.map((item) => {
        const productStock = stockMap.find((s) => s.product_id === item.productId);
        const updatedStock = (productStock?.stock || 0) + item.quantity;

        return axios.patch(
          `${config.productUrl}/${item.productId}/stock`,
          { stock: updatedStock },
          { headers: { 'x-api-key': config.orderServiceApiKey } },
        );
      });

      await Promise.allSettled(updateRequests);

      logger.info('✅ Stock restored for canceled order : ' + JSON.stringify(orderId));
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.info(
        '❌ Failed to restore stock for canceled order :',
        orderId + '\nerror : ' + (error as Error).message,
      );
    }
  }
}
