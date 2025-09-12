const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createProjectSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    assigned_users: Joi.array(objectId),
    createdBy: objectId,
    subject: objectId,
    due_date: Joi.date(),
    status: Joi.string().valid("active", "completed", "cancelled").default("active"),
    max_members: Joi.number(),
});

const updateProjectSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    assigned_users: Joi.array(objectId),
    createdBy: objectId,
    subject: objectId,
    due_date: Joi.date(),
    status: Joi.string().valid("active", "completed", "cancelled").default("active"),
    max_members: Joi.number(),
});

module.exports = {
    createProjectSchema,
    updateProjectSchema,
};