import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const createTestSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    total_questions: Joi.number().min(1).required(),
    date_start: Joi.date(),
    date_end: Joi.date(),
    time_limit: Joi.number().min(1).default(30),
    subject: objectId.required(),
    selected_modules: objectId.required(),
    created_by: objectId.required(),
    is_published: Joi.boolean().default(false),
    max_attempts: Joi.number().min(1).default(1),
    passing_score: Joi.number().min(0).max(100).default(60),
});

export const updateTestSchema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    total_questions: Joi.number().min(1),
    date_start: Joi.date(),
    date_end: Joi.date(),
    time_limit: Joi.number().min(1).default(30),
    subject: objectId,
    selected_modules: objectId,
    created_by: objectId,
    is_published: Joi.boolean().default(false),
    max_attempts: Joi.number().min(1).default(1),
    passing_score: Joi.number().min(0).max(100).default(60),
});
