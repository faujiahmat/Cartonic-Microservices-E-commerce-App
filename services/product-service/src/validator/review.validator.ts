import Joi from 'joi';
import { IReview } from '../models/review.model';

export const addReviewValidation = (
  payload: Partial<IReview>,
): Joi.ValidationResult<Partial<IReview>> => {
  const schema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.base': 'Rating harus berupa angka',
      'number.integer': 'Rating harus berupa bilangan bulat',
      'number.min': 'Rating minimal 1',
      'number.max': 'Rating maksimal 5',
      'any.required': 'Rating harus diisi',
    }),
    comment: Joi.string().trim().min(1).required().messages({
      'string.base': 'Komentar harus berupa string',
      'string.empty': 'Komentar tidak boleh kosong',
      'any.required': 'Komentar harus diisi',
    }),
  });
  return schema.validate(payload);
};
