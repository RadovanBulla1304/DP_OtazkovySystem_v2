const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createTeacherSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Meno je povinné',
        'string.min': 'Meno musí mať aspoň 2 znaky',
        'string.max': 'Meno nesmie presiahnuť 50 znakov',
        'any.required': 'Meno je povinné'
    }),
    surname: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Priezvisko je povinné',
        'string.min': 'Priezvisko musí mať aspoň 2 znaky',
        'string.max': 'Priezvisko nesmie presiahnuť 50 znakov',
        'any.required': 'Priezvisko je povinné'
    }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.empty': 'Email je povinný',
            'string.email': 'Email musí byť platná emailová adresa',
            'any.required': 'Email je povinný'
        }),
    password: Joi.string()
        .pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Heslo musí mať aspoň 6 znakov, jedno veľké písmeno a jedno číslo',
            'string.empty': 'Heslo je povinné',
            'any.required': 'Heslo je povinné'
        }),
    passwordConfirmation: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Potvrdenie hesla sa nezhoduje s heslom',
            'string.empty': 'Potvrdenie hesla je povinné',
            'any.required': 'Potvrdenie hesla je povinné'
        }),
    isAdmin: Joi.boolean().messages({
        'boolean.base': 'isAdmin musí byť boolean hodnota',
    }),
    isActive: Joi.boolean().messages({
        'boolean.base': 'isActive musí byť boolean hodnota',
    }),
    assignedSubjects: Joi.array().items(objectId).messages({
        'array.base': 'Priradené predmety musia byť pole'
    }),
});

const updateTeacherSchema = Joi.object({
    name: Joi.string().min(2).max(50).messages({
        'string.min': 'Meno musí mať aspoň 2 znaky',
        'string.max': 'Meno nesmie presiahnuť 50 znakov',
    }),
    surname: Joi.string().min(2).max(50).messages({
        'string.min': 'Priezvisko musí mať aspoň 2 znaky',
        'string.max': 'Priezvisko nesmie presiahnuť 50 znakov',
    }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .messages({
            'string.email': 'Email musí byť platná emailová adresa',
        }),
    isAdmin: Joi.boolean().messages({
        'boolean.base': 'isAdmin musí byť boolean hodnota',
    }),
    isActive: Joi.boolean().messages({
        'boolean.base': 'isActive musí byť boolean hodnota',
    })
});

module.exports = {
    createTeacherSchema,
    updateTeacherSchema,
};