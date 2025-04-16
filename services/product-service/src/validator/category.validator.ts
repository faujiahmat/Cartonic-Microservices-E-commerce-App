import Joi from 'joi';
import { ICategory } from '../models/category.model';

export const createCategoryValidation = (payload: ICategory) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      'string.base': 'Nama harus berupa teks.',
      'string.empty': 'Nama tidak boleh kosong.',
      'string.min': 'Nama minimal 3 karakter.',
      'string.max': 'Nama maksimal 50 karakter.',
      'any.required': 'Nama kategori wajib diisi.',
    }),
    description: Joi.string().max(255).optional().messages({
      'string.base': 'Deskripsi harus berupa teks.',
      'string.max': 'Deskripsi maksimal 255 karakter.',
    }),
  });
  return schema.validate(payload);
};

export const updateCategoryValidation = (payload: ICategory) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).optional().messages({
      'string.base': 'Nama harus berupa teks.',
      'string.empty': 'Nama tidak boleh kosong.',
      'string.min': 'Nama minimal 3 karakter.',
      'string.max': 'Nama maksimal 50 karakter.',
      'any.required': 'Nama kategori wajib diisi.',
    }),
    description: Joi.string().max(255).optional().messages({
      'string.base': 'Deskripsi harus berupa teks.',
      'string.max': 'Deskripsi maksimal 255 karakter.',
    }),
  });
  return schema.validate(payload);
};
