import { Status } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface IPayment {
  id: string;
  userId: string;
  orderId: string;
  amount: Decimal;
  status?: Status;
  paymentMethod: string;
  createdAt?: Date;
  updatedAt?: Date;
}
