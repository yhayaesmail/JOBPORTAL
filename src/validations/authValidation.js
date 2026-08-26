import Joi from 'joi';

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain an uppercase letter, a lowercase letter and a number',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('candidate', 'employer').required().messages({
    'any.only': 'Role must be either candidate or employer',
    'any.required': 'Role is required (candidate or employer)',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});
