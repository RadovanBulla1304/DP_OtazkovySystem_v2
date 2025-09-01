import Joi from 'joi';



const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const createSubjectSchema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    description: Joi.string().allow('').optional(),
    assigned_teachers: Joi.array().items(objectId),
    assigned_students: Joi.array().items(objectId),
    is_active: Joi.boolean().optional(),
});

export const editSubjectSchema = Joi.object({
    name: Joi.string(),
    code: Joi.string(),
    description: Joi.string().allow(''),
    assigned_teachers: Joi.array().items(objectId),
    assigned_students: Joi.array().items(objectId),
    is_active: Joi.boolean(),
});

