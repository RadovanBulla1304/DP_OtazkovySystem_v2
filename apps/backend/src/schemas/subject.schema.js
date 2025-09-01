const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const createSubject = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "validation.empty_name",
        "any.required": "validation.empty_name"
    }),
    code: Joi.string().required().messages({
        "string.empty": "validation.empty_code",
        "any.required": "validation.empty_code"
    }),
    description: Joi.string().allow('').optional(),
    assigned_teachers: Joi.array().items(objectId), // Array of valid Teacher ObjectIds
    assigned_students: Joi.array().items(objectId), // Array of valid User ObjectIds
    is_active: Joi.boolean().optional(),
});

const editSubject = Joi.object({
    name: Joi.string(), // Name is required
    code: Joi.string(),
    description: Joi.string(),
    assigned_teachers: Joi.array().items(objectId),
    assigned_students: Joi.array().items(objectId), // Array of valid MongoDB ObjectIds
    is_active: Joi.boolean(),
});

module.exports = {
    createSubject,
    editSubject,
};
