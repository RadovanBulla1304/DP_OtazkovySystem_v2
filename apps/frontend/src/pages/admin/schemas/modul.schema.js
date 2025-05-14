import Joi from 'joi';


export const createModulSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Názov modulu je povinný.'
    }),
    date_start: Joi.date().required().messages({
        'date.base': 'Dátum začiatku musí byť platný dátum.',
        'any.required': 'Dátum začiatku je povinný.'
    }),
    date_end: Joi.date()
        .required()
        .min(Joi.ref('date_start'))
        .messages({
            'date.base': 'Dátum konca musí byť platný dátum.',
            'any.required': 'Dátum konca je povinný.',
            'date.min': 'Dátum konca nemôže byť pred dátumom začiatku.'
        }),
    subject: Joi.string().required().messages({
        'string.empty': 'Predmet je povinný.'
    })
});

export const editModulSchema = Joi.object({
    title: Joi.string(),
    date_start: Joi.date().iso(),
    date_end: Joi.date().iso().when('date_start', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('date_start')),
        otherwise: Joi.date()
    }),
    deleted: Joi.boolean(),
    subject: Joi.string().regex(/^[0-9a-fA-F]{24}$/) // Optional subject reference for editing
});

