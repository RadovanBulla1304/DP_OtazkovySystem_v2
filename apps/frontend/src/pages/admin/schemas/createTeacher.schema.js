import Joi from 'joi';

export const createTeacherSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'Meno je povinné',
        'any.required': 'Meno je povinné'
    }),
    surname: Joi.string().min(2).required().messages({
        'string.empty': 'Priezvisko je povinné',
        'any.required': 'Priezvisko je povinné'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'Email je povinný',
        'any.required': 'Email je povinný',
        'string.email': 'Email musí byť platný'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Heslo je povinné',
        'any.required': 'Heslo je povinné'
    }),
    password_confirmation: Joi.string().required().messages({
        'string.empty': 'Potvrdenie hesla je povinné',
        'any.required': 'Potvrdenie hesla je povinné'
    }),
    is_admin: Joi.boolean().optional(),
    is_active: Joi.boolean().optional()
});
