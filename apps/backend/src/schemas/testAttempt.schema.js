const Joi = require("joi");
import { createQuestion } from './question.schema'

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createTestAttemptSchema = Joi.object({
    test: objectId.required(),
    user: objectId.required(),
    questions: Joi.array().items(createQuestion).min(1).required(),
    startedAt: Joi.date(),
    submittedAt: Joi.date(),
    score: Joi.number().min(0).max(100),
    passed: Joi.boolean(),
    totalTimeSpent: Joi.number().min(0),
    isCompleted: Joi.boolean(),
});

const updateTestAttemptSchema = Joi.object({
    test: objectId,
    user: objectId,
    questions: Joi.array().items(createQuestion),
    startedAt: Joi.date(),
    submittedAt: Joi.date(),
    score: Joi.number().min(0).max(100),
    passed: Joi.boolean(),
    totalTimeSpent: Joi.number().min(0),
    isCompleted: Joi.boolean(),
});

module.exports = {
    createTestAttemptSchema,
    updateTestAttemptSchema,
};