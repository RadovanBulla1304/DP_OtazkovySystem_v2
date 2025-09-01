const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createTeacherSchema = Joi.object({
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
});

const updateTeacherSchema = Joi.object({
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
    is_admin: Joi.boolean().messages({
        'boolean.base': 'isAdmin must be a boolean value',
    }),
    is_active: Joi.boolean().messages({
        'boolean.base': 'isActive must be a boolean value',
    }),
    assigned_subjects: Joi.array().items(objectId),
});

module.exports = {
    createTeacherSchema,
    updateTeacherSchema,
};