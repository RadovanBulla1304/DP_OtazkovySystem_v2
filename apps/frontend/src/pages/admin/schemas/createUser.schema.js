import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters',
  }),
  surname: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Surname is required',
    'string.min': 'Surname must be at least 2 characters',
    'string.max': 'Surname must not exceed 50 characters',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),
  personalNumber: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.empty': 'Personal number is required',
      'string.pattern.base': 'Personal number must be exactly 6 digits',
    }),
  userType: Joi.string()
    .valid('student', 'employee', 'admin')
    .required()
    .messages({
      'any.only': 'User type must be either student, employee or admin',
      'string.empty': 'User type is required',
    }),
  password: Joi.string()
    .when('userType', {
      is: 'student',
      then: Joi.string()
        .pattern(/^[A-Za-z][0-9]{12}[A-Za-z]$/)
        .required()
        .messages({
          'string.pattern.base':
            'Password must follow the ISIC format: Letter + 12 digits + Letter',
        }),
      otherwise: Joi.string().min(8).max(128).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
      }),
    }),
  passwordConfirmation: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match password',
      'string.empty': 'Password confirmation is required',
    }),
});



export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters'
  }),
  surname: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Surname is required',
    'string.min': 'Surname must be at least 2 characters',
    'string.max': 'Surname must not exceed 50 characters'
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address'
    }),
  isActive: Joi.boolean().required().messages({
    'boolean.base': 'isActive must be a boolean value'
  }),
  userType: Joi.string()
    .valid('student', 'employee', 'admin')
    .optional()
    .messages({
      'any.only': 'User type must be either student or employee',
      'string.empty': 'User type is required if provided',
    }),
});
