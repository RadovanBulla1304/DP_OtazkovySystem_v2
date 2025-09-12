import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const createProjectSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    assigned_users: Joi.array().items(objectId),
    createdBy: objectId,
    subject: objectId,
    due_date: Joi.date(),
    status: Joi.string().valid('active', 'completed', 'cancelled').default('active'),
    max_members: Joi.number(),
});

export const updateProjectSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    assigned_users: Joi.array().items(objectId),
    createdBy: objectId,
    subject: objectId,
    due_date: Joi.date(),
    status: Joi.string().valid('active', 'completed', 'cancelled').default('active'),
    max_members: Joi.number(),
});
