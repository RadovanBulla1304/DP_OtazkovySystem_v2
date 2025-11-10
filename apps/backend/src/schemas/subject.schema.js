const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Neplatné ID',
    'string.empty': 'ID je povinné',
    'any.required': 'ID je povinné'
});

const createSubject = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Názov predmetu je povinný",
        "any.required": "Názov predmetu je povinný"
    }),
    code: Joi.string().required().messages({
        "string.empty": "Kód predmetu je povinný",
        "any.required": "Kód predmetu je povinný"
    }),
    description: Joi.string().allow('').optional().messages({
        'string.base': 'Popis musí byť text'
    }),
    createdBy: objectId.required().messages({
        'string.empty': 'ID vytvoriteľa je povinné',
        'any.required': 'ID vytvoriteľa je povinné'
    }),
    assigned_teachers: Joi.array().items(objectId).optional().messages({
        'array.base': 'Učitelia musia byť pole'
    }),
    assigned_students: Joi.array().items(objectId).optional().messages({
        'array.base': 'Študenti musia byť pole'
    }),
    is_active: Joi.boolean().default(true).messages({
        'boolean.base': 'Aktívny musí byť boolean'
    }),
    moduls: Joi.array().items(objectId).optional().messages({
        'array.base': 'Moduly musia byť pole'
    })
});

const editSubject = Joi.object({
    name: Joi.string().messages({
        "string.empty": "Názov predmetu nemôže byť prázdny"
    }),
    code: Joi.string().messages({
        "string.empty": "Kód predmetu nemôže byť prázdny"
    }),
    description: Joi.string().allow('').optional().messages({
        'string.base': 'Popis musí byť text'
    }),
    assigned_teachers: Joi.array().items(objectId).optional().messages({
        'array.base': 'Učitelia musia byť pole'
    }),
    assigned_students: Joi.array().items(objectId).optional().messages({
        'array.base': 'Študenti musia byť pole'
    }),
    is_active: Joi.boolean().messages({
        'boolean.base': 'Aktívny musí byť boolean'
    }),
    moduls: Joi.array().items(objectId).optional().messages({
        'array.base': 'Moduly musia byť pole'
    })
});

module.exports = {
    createSubject,
    editSubject,
};
