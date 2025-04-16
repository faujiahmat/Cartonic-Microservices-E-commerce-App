import Joi from 'joi';
import { Status } from '@prisma/client';
import { IPayment } from '../types/payment.type';

export const createPaymentValidation = (payload: IPayment): Joi.ValidationResult<IPayment> => {
  const schema = Joi.object({
    id: Joi.string().trim().uuid(),
    orderId: Joi.string().trim().required().messages({
      'string.empty': 'OrderId harus di isi',
      'any.required': 'OrderId harus diisi',
    }),
    amount: Joi.number().precision(2).min(1).required().messages({
      'number.base': 'Jumlah harus berupa angka',
      'number.min': 'Jumlah tidak boleh kurang dari 1',
      'any.required': 'Jumlah harus diisi',
    }),
    status: Joi.string()
      .valid(...Object.values(Status))
      .default(Status.PENDING)
      .messages({
        'any.only': 'Status tidak valid',
      }),
    paymentMethod: Joi.string().trim().min(3).max(50).required().messages({
      'string.base': 'Metode pembayaran harus berupa string',
      'string.empty': 'Metode pembayaran tidak boleh kosong',
      'string.min': 'Metode pembayaran minimal 3 karakter',
      'string.max': 'Metode pembayaran maksimal 50 karakter',
      'any.required': 'Metode pembayaran harus diisi',
    }),
  });

  return schema.validate(payload);
};

export const updatePaymentMethodValidation = (
  payload: Partial<IPayment>,
): Joi.ValidationResult<Partial<IPayment>> => {
  const schema = Joi.object({
    paymentMethod: Joi.string().trim().min(3).max(50).required().messages({
      'string.base': 'Metode pembayaran harus berupa string',
      'string.empty': 'Metode pembayaran tidak boleh kosong',
      'string.min': 'Metode pembayaran minimal 3 karakter',
      'string.max': 'Metode pembayaran maksimal 50 karakter',
      'any.required': 'Metode pembayaran harus diisi',
    }),
  });

  return schema.validate(payload);
};

export const updatePaymentValidation = (
  payload: Partial<IPayment>,
): Joi.ValidationResult<Partial<IPayment>> => {
  const schema = Joi.object({
    id: Joi.string().trim().uuid().required().messages({
      'string.empty': 'Id harus diisi',
      'string.base': 'Id harus berupa string',
      'any.required': 'Id harus diisi',
      'string.guid': 'Id tidak valid',
    }),
    status: Joi.string()
      .valid(...Object.values(Status))
      .default(Status.PENDING)
      .required()
      .messages({
        'any.only': 'Status tidak valid',
      }),
  });

  return schema.validate(payload);
};
