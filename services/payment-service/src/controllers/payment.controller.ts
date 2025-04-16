import { Request, Response } from 'express';
import { Status } from '@prisma/client';
import { PaymentService } from '../services/payment.service';
import {
  createPaymentValidation,
  updatePaymentMethodValidation,
  updatePaymentValidation,
} from '../validator/payment.validation';
import { Decimal } from '@prisma/client/runtime/library';
import amqp from 'amqplib';
import { config } from '../configs/config';
import logger from '../utils/winston';
import { verifyAccessToken } from '../utils/jwt';
import Sentry from '../utils/sentry';

const publishPaymentEvent = async (
  paymentId: string,
  userId: string,
  status: string,
  amount: Decimal,
) => {
  try {
    const connection = await amqp.connect(config.rabbitmqUrl);
    const channel = await connection.createChannel();

    const event = { paymentId, userId, status, amount };

    channel.sendToQueue('payment_notification', Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });
    logger.info('Published payment event : ' + event);
  } catch (error) {
    Sentry.captureException(error);
    logger.error('Failed to publish payment event : ' + (error as Error).message);
  }
};

export class PaymentController {
  static async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const userId = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      const role = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).role;

      if (role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses',
          data: null,
          error: 'Forbidden',
        });
        return;
      }

      const { error, value } = createPaymentValidation(req.body);

      if (error != null) {
        res.status(400).json({
          succsess: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const newPayment = await PaymentService.createPayment({
        ...value,
        status: value.status as Status,
        userId,
      });

      res.status(201).json({
        success: true,
        message: 'Pembayaran berhasil',
        data: newPayment,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on src/controllers/payment.controller.ts - createPayment : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/payment.controller.ts - createPayment',
        error: (error as Error).message,
      });
    }
  }

  static async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const role = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).role;

      if (role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses',
          data: null,
          error: 'Forbidden',
        });
        return;
      }

      const { id } = req.params;
      const payment = await PaymentService.getPaymentById(id);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pembayaran tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Pembayaran ditemukan',
        data: payment,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on src/controllers/payment.controller.ts - getPayment : ' + (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/payment.controller.ts - getPayment',
        error: (error as Error).message,
      });
    }
  }

  static async updatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const userId = verifyAccessToken(req.headers.authorization?.split(' ')[1] as string).user_id;

      const { id } = req.params;

      const getPayment = await PaymentService.getPaymentById(id);

      if (!getPayment) {
        res.status(404).json({
          success: false,
          message: 'Pembayaran tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      if (getPayment.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses',
          data: null,
          error: 'Forbidden',
        });
        return;
      }

      const { error, value } = updatePaymentMethodValidation(req.body);

      if (error != null) {
        res.status(400).json({
          success: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const updatedPayment = await PaymentService.updatePaymentMethod(
        id,
        value.paymentMethod as string,
      );

      res.status(200).json({
        success: true,
        message: 'Berhasil memperbarui metode pembayaran',
        data: updatedPayment,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on src/controllers/payment.controller.ts - updatePaymentMethod : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/payment.controller.ts - updatePaymentMethod',
        error: (error as Error).message,
      });
    }
  }

  static async paymentWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = updatePaymentValidation(req.body);

      if (error != null) {
        res.status(400).json({
          success: false,
          message: 'Input data gagal',
          data: value,
          error: error.details[0].message,
        });
        return;
      }

      const getPayment = await PaymentService.getPaymentById(value.id as string);

      if (!getPayment) {
        res.status(404).json({
          success: false,
          message: 'Pembayaran tidak ditemukan',
          data: null,
          error: 'Not found',
        });
        return;
      }

      const updatedPayment = await PaymentService.updatePaymentStatus(
        value.id as string,
        value.status as Status,
      );

      publishPaymentEvent(
        updatedPayment.id,
        updatedPayment.userId,
        updatedPayment.status,
        updatedPayment.amount,
      );
      const newStatus = (status: string): string => {
        if (status === 'PAID') return 'CONFIRMED';
        if (status === 'FAILED') return 'CANCELED';
        if (status === 'CANCELED') return 'CANCELED';
        return status;
      };

      const updatedStatus = newStatus(value.status as string);

      if (updatedStatus) {
        const connection = await amqp.connect(config.rabbitmqUrl);
        const channel = await connection.createChannel();

        channel.sendToQueue(
          'payment_status_update',
          Buffer.from(
            JSON.stringify({
              orderId: updatedPayment.orderId,
              status: updatedStatus,
            }),
          ),
          { persistent: true },
        );

        logger.info('Payment status update sent to order-service');
      }

      res.status(200).json({
        success: true,
        message: 'Webhook berhasil diproses',
        data: updatedPayment,
        error: null,
      });
    } catch (error: Error | unknown) {
      Sentry.captureException(error);
      logger.error(
        'Error on src/controllers/payment.controllers.ts - paymentWebhook : ' +
          (error as Error).message,
      );
      res.status(500).json({
        success: false,
        message: 'Error on src/controllers/payment.controllers.ts - paymentWebhook',
        data: null,
        error: (error as Error).message,
      });
    }
  }
}
