import Joi from 'joi';
import { ItemsTypeArray } from '../type/items.type';
import Istatus from '../type/status.type';

export const createOrderValidation = (
  payload: ItemsTypeArray,
): Joi.ValidationResult<ItemsTypeArray> => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required().messages({
            'string.base': 'Product ID harus berupa string',
            'string.empty': 'Product ID tidak boleh kosong',
            'any.required': 'Product ID harus diisi',
          }),
          quantity: Joi.number().integer().min(1).required().messages({
            'number.base': 'Quantity harus berupa angka',
            'number.integer': 'Quantity harus berupa bilangan bulat',
            'number.min': 'Quantity minimal 1',
            'any.required': 'Quantity harus diisi',
          }),
        }),
      )
      .min(1)
      .required()
      .messages({
        'array.base': 'Items harus berupa array',
        'array.min': 'Minimal harus ada satu item dalam order',
        'any.required': 'Items harus diisi',
      }),
  });
  return schema.validate(payload);
};

export const statusValidation = (payload: Istatus): Joi.ValidationResult<Istatus> => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELED')
      .required()
      .messages({
        'string.base': 'Status harus berupa string',
        'string.empty': 'Status tidak boleh kosong',
        'any.only':
          'Status harus berupa salah satu dari PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELED',
        'any.required': 'Status harus diisi',
      }),
  });
  return schema.validate(payload);
};
