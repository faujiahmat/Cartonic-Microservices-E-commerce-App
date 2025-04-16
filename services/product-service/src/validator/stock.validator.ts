import Joi from 'joi';

export const updateStockValidation = (payload: {
  product_id: string;
  stock: number;
}): Joi.ValidationResult<{ stock: number }> => {
  const schema = Joi.object({
    stock: Joi.number().integer().min(0).required().messages({
      'number.base': 'Stok harus berupa angka',
      'number.integer': 'Stok harus berupa bilangan bulat',
      'number.min': 'Stok tidak boleh kurang dari 0',
      'any.required': 'Stok harus diisi',
    }),
  });

  return schema.validate(payload);
};
