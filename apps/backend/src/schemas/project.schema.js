const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createProjectSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Názov projektu je povinný',
        'any.required': 'Názov projektu je povinný'
    }),
    description: Joi.string().allow('').optional().messages({
        'string.base': 'Popis musí byť text'
    }),
    subject: objectId.required().messages({
        'string.empty': 'Predmet je povinný',
        'any.required': 'Predmet je povinný',
        'string.pattern.base': 'Neplatné ID predmetu'
    }),
    due_date: Joi.date().optional().messages({
        'date.base': 'Neplatný dátum'
    }),
    max_members: Joi.number().integer().min(1).default(5).messages({
        'number.base': 'Maximálny počet členov musí byť číslo',
        'number.integer': 'Maximálny počet členov musí byť celé číslo',
        'number.min': 'Minimálny počet členov je 1'
    }),
    max_points: Joi.number().integer().min(1).required().messages({
        'number.base': 'Maximálny počet bodov musí byť číslo',
        'number.integer': 'Maximálny počet bodov musí byť celé číslo',
        'number.min': 'Minimálny počet bodov je 1',
        'any.required': 'Maximálny počet bodov je povinný'
    }),
});

const updateProjectSchema = Joi.object({
    name: Joi.string().messages({
        'string.empty': 'Názov projektu nesmie byť prázdny',
        'string.base': 'Názov musí byť text'
    }),
    description: Joi.string().allow('').messages({
        'string.base': 'Popis musí byť text'
    }),
    subject: objectId.allow(null).messages({
        'string.pattern.base': 'Neplatné ID predmetu'
    }),
    due_date: Joi.date().messages({
        'date.base': 'Neplatný dátum'
    }),
    status: Joi.string().valid('active', 'completed', 'cancelled').messages({
        'any.only': 'Stav musí byť: active, completed alebo cancelled',
        'string.base': 'Stav musí byť text'
    }),
    max_members: Joi.number().integer().min(1).messages({
        'number.base': 'Maximálny počet členov musí byť číslo',
        'number.integer': 'Maximálny počet členov musí byť celé číslo',
        'number.min': 'Minimálny počet členov je 1'
    }),
    max_points: Joi.number().integer().min(1).messages({
        'number.base': 'Maximálny počet bodov musí byť číslo',
        'number.integer': 'Maximálny počet bodov musí byť celé číslo',
        'number.min': 'Minimálny počet bodov je 1'
    }),
});

module.exports = {
    createProjectSchema,
    updateProjectSchema,
};