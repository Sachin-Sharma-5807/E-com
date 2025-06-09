
import Joi from 'joi';

export const signUpSchema = Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.'
    }),
    phone_number: Joi.string()
      .length(10)
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits.',
        'string.length': 'Phone number must be exactly 10 digits.'
      }),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.any()
      .valid(Joi.ref('password'))
      .required()
      .messages({ 'any.only': 'Confirm password must match password' }),
  });