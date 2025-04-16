import prisma from '../configs/prisma.config';
import { Payment, Status } from '@prisma/client';

export class PaymentService {
  static async createPayment(
    data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Payment> {
    return await prisma.payment.create({
      data,
    });
  }

  static async getPaymentById(id: string) {
    return await prisma.payment.findUnique({
      where: { id },
    });
  }

  static async updatePaymentMethod(id: string, paymentMethod: string) {
    return await prisma.payment.update({
      where: { id },
      data: { paymentMethod },
    });
  }

  static async updatePaymentStatus(id: string, status: Status) {
    return await prisma.payment.update({
      where: { id },
      data: { status },
    });
  }

  static async deletePayment(id: string) {
    return await prisma.payment.delete({
      where: { id },
    });
  }
}
