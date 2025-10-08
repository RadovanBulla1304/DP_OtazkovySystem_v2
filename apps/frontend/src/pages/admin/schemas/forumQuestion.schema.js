import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const createForumQuestionSchema = Joi.object({
    header: Joi.string().required().messages({
        'string.empty': 'Nadpis je povinný',
        'any.required': 'Nadpis je povinný',
        'string.base': 'Nadpis musí byť text'
    }),
    description: Joi.string().required().messages({
        'string.empty': 'Popis je povinný',
        'any.required': 'Popis je povinný',
        'string.base': 'Popis musí byť text'
    }),
    tags: Joi.array().items(Joi.string()).messages({
        'array.base': 'Tagy musia byť pole',
        'string.base': 'Tag musí byť text'
    }),
    modul: objectId.required().messages({
        'string.empty': 'Modul je povinný',
        'any.required': 'Modul je povinný',
        'string.pattern.base': 'Neplatné ID modulu'
    }),
});

export const updateForumQuestionSchema = Joi.object({
    header: Joi.string().messages({
        'string.empty': 'Nadpis nesmie byť prázdny',
        'string.base': 'Nadpis musí byť text'
    }),
    description: Joi.string().messages({
        'string.empty': 'Popis nesmie byť prázdny',
        'string.base': 'Popis musí byť text'
    }),
    tags: Joi.array().items(Joi.string()).messages({
        'array.base': 'Tagy musia byť pole',
        'string.base': 'Tag musí byť text'
    }),
    modul: objectId.messages({
        'string.pattern.base': 'Neplatné ID modulu'
    }),
    is_pinned: Joi.boolean().messages({
        'boolean.base': 'Pripnuté musí byť true alebo false'
    }),
    is_closed: Joi.boolean().messages({
        'boolean.base': 'Uzatvorené musí byť true alebo false'
    }),
});
