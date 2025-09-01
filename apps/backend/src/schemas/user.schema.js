const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createUserSchema = Joi.object({
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
  groupNumber: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Group number is required',
    'string.min': 'Group number must be at least 1 character',
    'string.max': 'Group number must not exceed 50 characters',
  }),
  studentNumber: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Student number is required',
    'string.min': 'Student number must be at least 1 character',
    'string.max': 'Student number must not exceed 50 characters',
  }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 6 characters, include one uppercase letter and one number.',
      'string.empty': 'Password is required',
    }),
  passwordConfirmation: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match password',
      'string.empty': 'Password confirmation is required',
    }),
  isAdmin: Joi.boolean().messages({
    'boolean.base': 'isAdmin must be a boolean value',
  }),
  isActive: Joi.boolean().messages({
    'boolean.base': 'isActive must be a boolean value',
  }),
  assignedSubjects: Joi.array().items(objectId),
  assignedProjects: Joi.array().items(objectId),
  points: Joi.array().items(objectId),
  weeklyQuestionCount: Joi.array().items(
    Joi.object({
      week: Joi.date().required(),
      count: Joi.number(),
      moduleId: objectId,
    })
  ),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters',
  }),
  surname: Joi.string().min(2).max(50).messages({
    'string.min': 'Surname must be at least 2 characters',
    'string.max': 'Surname must not exceed 50 characters',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  groupNumber: Joi.string().min(1).max(50).messages({
    'string.min': 'Group number must be at least 1 character',
    'string.max': 'Group number must not exceed 50 characters',
  }),
  studentNumber: Joi.string().min(1).max(50).messages({
    'string.min': 'Student number must be at least 1 character',
    'string.max': 'Student number must not exceed 50 characters',
  }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)
    .messages({
      'string.pattern.base': 'Password must be at least 6 characters, include one uppercase letter and one number.',
    }),
  passwordConfirmation: Joi.string()
    .valid(Joi.ref('password'))
    .messages({
      'any.only': 'Password confirmation does not match password',
    }),
  isAdmin: Joi.boolean().messages({
    'boolean.base': 'isAdmin must be a boolean value',
  }),
  isActive: Joi.boolean().messages({
    'boolean.base': 'isActive must be a boolean value',
  }),
  assignedSubjects: Joi.array().items(objectId),
  assignedProjects: Joi.array().items(objectId),
  points: Joi.array().items(objectId),
  weeklyQuestionCount: Joi.array().items(
    Joi.object({
      week: Joi.date().required(),
      count: Joi.number(),
      moduleId: objectId,
    })
  ),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};