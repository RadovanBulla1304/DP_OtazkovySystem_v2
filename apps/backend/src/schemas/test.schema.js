const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Neplatné ID',
    'string.empty': 'ID je povinné',
    'any.required': 'ID je povinné'
});

const createTestSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Názov testu je povinný',
        'any.required': 'Názov testu je povinný'
    }),
    description: Joi.string().allow('').optional().messages({
        'string.base': 'Popis musí byť text'
    }),
    total_questions: Joi.number().min(1).required().messages({
        'number.base': 'Počet otázok musí byť číslo',
        'number.min': 'Počet otázok musí byť aspoň 1',
        'any.required': 'Počet otázok je povinný'
    }),
    date_start: Joi.date().required().messages({
        'date.base': 'Neplatný dátum začiatku',
        'any.required': 'Dátum začiatku je povinný'
    }),
    date_end: Joi.date().required().messages({
        'date.base': 'Neplatný dátum ukončenia',
        'any.required': 'Dátum ukončenia je povinný'
    }),
    time_limit: Joi.number().min(1).default(30).messages({
        'number.base': 'Časový limit musí byť číslo',
        'number.min': 'Časový limit musí byť aspoň 1 minúta'
    }),
    subject: objectId.required().messages({
        'string.pattern.base': 'Neplatné ID predmetu',
        'string.empty': 'Predmet je povinný',
        'any.required': 'Predmet je povinný'
    }),
    selected_modules: Joi.array().items(objectId).min(1).required().messages({
        'array.base': 'Moduly musia byť pole',
        'array.min': 'Musíte vybrať aspoň 1 modul',
        'any.required': 'Moduly sú povinné'
    }),
    is_published: Joi.boolean().default(false).messages({
        'boolean.base': 'Publikovaný musí byť boolean'
    }),
    max_attempts: Joi.number().min(1).default(1).messages({
        'number.base': 'Maximálny počet pokusov musí byť číslo',
        'number.min': 'Maximálny počet pokusov musí byť aspoň 1'
    }),
    passing_score: Joi.number().min(0).max(100).default(60).messages({
        'number.base': 'Percentuálna hranica úspešnosti musí byť číslo',
        'number.min': 'Percentuálna hranica úspešnosti musí byť aspoň 0',
        'number.max': 'Percentuálna hranica úspešnosti môže byť maximálne 100'
    }),
    max_points: Joi.number().min(1).default(10).messages({
        'number.base': 'Maximálny počet bodov musí byť číslo',
        'number.min': 'Maximálny počet bodov musí byť aspoň 1'
    }),
    skipValidationCheck: Joi.boolean().optional()
});

const updateTestSchema = Joi.object({
    title: Joi.string().messages({
        'string.empty': 'Názov testu nemôže byť prázdny'
    }),
    description: Joi.string().allow('').optional().messages({
        'string.base': 'Popis musí byť text'
    }),
    total_questions: Joi.number().min(1).messages({
        'number.base': 'Počet otázok musí byť číslo',
        'number.min': 'Počet otázok musí byť aspoň 1'
    }),
    date_start: Joi.date().messages({
        'date.base': 'Neplatný dátum začiatku'
    }),
    date_end: Joi.date().messages({
        'date.base': 'Neplatný dátum ukončenia'
    }),
    time_limit: Joi.number().min(1).messages({
        'number.base': 'Časový limit musí byť číslo',
        'number.min': 'Časový limit musí byť aspoň 1 minúta'
    }),
    subject: objectId.messages({
        'string.pattern.base': 'Neplatné ID predmetu'
    }),
    selected_modules: Joi.array().items(objectId).min(1).messages({
        'array.base': 'Moduly musia byť pole',
        'array.min': 'Musíte vybrať aspoň 1 modul'
    }),
    is_published: Joi.boolean().messages({
        'boolean.base': 'Publikovaný musí byť boolean'
    }),
    max_attempts: Joi.number().min(1).messages({
        'number.base': 'Maximálny počet pokusov musí byť číslo',
        'number.min': 'Maximálny počet pokusov musí byť aspoň 1'
    }),
    passing_score: Joi.number().min(0).max(100).messages({
        'number.base': 'Percentuálna hranica úspešnosti musí byť číslo',
        'number.min': 'Percentuálna hranica úspešnosti musí byť aspoň 0',
        'number.max': 'Percentuálna hranica úspešnosti môže byť maximálne 100'
    }),
    max_points: Joi.number().min(1).messages({
        'number.base': 'Maximálny počet bodov musí byť číslo',
        'number.min': 'Maximálny počet bodov musí byť aspoň 1'
    })
});

module.exports = {
    createTestSchema,
    updateTestSchema,
};