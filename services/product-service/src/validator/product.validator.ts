import Joi from 'joi';
import { IProduct } from '../models/product.model';
import mongoose from 'mongoose';

export const createProductValidation = (payload: IProduct): Joi.ValidationResult<IProduct> => {
  const schema = Joi.object({
    product_id: Joi.string().uuid(),
    name: Joi.string().trim().min(3).max(100).required().messages({
      'string.base': 'Nama produk harus berupa string',
      'string.empty': 'Nama produk tidak boleh kosong',
      'string.min': 'Nama produk minimal 3 karakter',
      'string.max': 'Nama produk maksimal 100 karakter',
      'any.required': 'Nama produk harus diisi',
    }),
    description: Joi.string().max(500).optional().messages({
      'string.base': 'Deskripsi harus berupa string',
      'string.max': 'Deskripsi maksimal 500 karakter',
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Harga harus berupa angka',
      'number.min': 'Harga tidak boleh kurang dari 0',
      'any.required': 'Harga harus diisi',
    }),
    stock: Joi.number().integer().min(0).required().messages({
      'number.base': 'Stok harus berupa angka',
      'number.integer': 'Stok harus berupa bilangan bulat',
      'number.min': 'Stok tidak boleh kurang dari 0',
      'any.required': 'Stok harus diisi',
    }),
    category: Joi.array()
      .items(
        Joi.string().custom((value, helpers) => {
          return mongoose.Types.ObjectId.isValid(value) ? value : helpers.error('any.invalid');
        }, 'ObjectId Validation'),
      )
      .optional()
      .messages({
        'array.base': 'Kategori harus berupa array',
        'any.invalid': 'Kategori tidak valid',
      }),
    images: Joi.array().items(Joi.string().trim().min(1)).min(1).required().messages({
      'array.base': 'Image harus berupa array',
      'array.min': 'Setidaknya harus ada satu image',
      'any.required': 'Image harus diisi',
    }),
  });

  return schema.validate(payload);
};

export const updateProductValidation = (payload: IProduct): Joi.ValidationResult<IProduct> => {
  const schema = Joi.object({
    product_id: Joi.string().uuid(),
    name: Joi.string().trim().min(3).max(100).required().optional().messages({
      'string.base': 'Nama produk harus berupa string',
      'string.empty': 'Nama produk tidak boleh kosong',
      'string.min': 'Nama produk minimal 3 karakter',
      'string.max': 'Nama produk maksimal 100 karakter',
      'any.required': 'Nama produk harus diisi',
    }),
    description: Joi.string().max(500).optional().messages({
      'string.base': 'Deskripsi harus berupa string',
      'string.max': 'Deskripsi maksimal 500 karakter',
    }),
    price: Joi.number().min(0).optional().messages({
      'number.base': 'Harga harus berupa angka',
      'number.min': 'Harga tidak boleh kurang dari 0',
      'any.required': 'Harga harus diisi',
    }),
    stock: Joi.number().integer().min(0).optional().messages({
      'number.base': 'Stok harus berupa angka',
      'number.integer': 'Stok harus berupa bilangan bulat',
      'number.min': 'Stok tidak boleh kurang dari 0',
      'any.required': 'Stok harus diisi',
    }),
    images: Joi.array().items(Joi.string().trim().min(1)).min(1).optional().messages({
      'array.base': 'Image harus berupa array',
      'array.min': 'Setidaknya harus ada satu image',
      'any.required': 'Image harus diisi',
    }),
    category: Joi.array()
      .items(
        Joi.string().custom((value, helpers) => {
          return mongoose.Types.ObjectId.isValid(value) ? value : helpers.error('any.invalid');
        }, 'ObjectId Validation'),
      )
      .optional()
      .messages({
        'array.base': 'Kategori harus berupa array',
        'any.invalid': 'Kategori tidak valid',
      }),
  });

  return schema.validate(payload);
};
