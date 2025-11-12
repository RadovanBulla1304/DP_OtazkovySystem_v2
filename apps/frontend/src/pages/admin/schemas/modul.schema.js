import Joi from 'joi';

export const createModulSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Názov modulu je povinný.'
    }),
    description: Joi.string().required().messages({
        'string.empty': 'Popis modulu je povinný.'
    }),
    week_number: Joi.number().min(1).messages({
        'number.base': 'Týždeň musí byť číslo.',
        'number.min': 'Týždeň musí byť aspoň 1.'
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
    subject: Joi.string(),
    createdBy: Joi.string(),
    is_active: Joi.boolean(),
    required_questions_per_user: Joi.number().messages({
        'number.base': 'Počet povinných otázok musí byť číslo.'
    })
});


export const editModulSchema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    week_number: Joi.number().min(1),
    date_start: Joi.date().iso(),
    date_end: Joi.date().iso().when('date_start', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('date_start')),
        otherwise: Joi.date()
    }),
    subject: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    is_active: Joi.boolean(),
    required_questions_per_user: Joi.number(),
});

