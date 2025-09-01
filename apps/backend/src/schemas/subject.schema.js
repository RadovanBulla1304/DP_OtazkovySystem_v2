const Joi = require("joi");

const createSubject = Joi.object({
    name: Joi.string(), // Name is required
    code: Joi.string().required(),
    description: Joi.string().required(),
    assigned_teachers: Joi.array().items(objectId),
    assigned_students: Joi.array().items(objectId), // Array of valid MongoDB ObjectIds
    is_active: Joi.boolean(),
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
