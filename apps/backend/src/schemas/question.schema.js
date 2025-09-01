const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createQuestionSchema = Joi.object({
    text: Joi.string().required(),
    options: Joi.object({
        a: Joi.string().required(),
        b: Joi.string().required(),
        c: Joi.string().required(),
        d: Joi.string().required()
    }).required(),
    correct: Joi.string().valid('a', 'b', 'c', 'd').required(),
    modul: objectId.required(),
    createdBy: objectId.required(),
    validated: Joi.boolean(),
    validated_by: objectId,
    validated_at: Joi.date(),
    validation_comment: Joi.string(),
    user_agreement: Joi.object({
        agreed: Joi.boolean(),
        comment: Joi.string(),
        responded_at: Joi.date(),
    }),
    rating_stats: Joi.object({
        average_rating: Joi.number(),
        total_ratings: Joi.number(),
    }),
    is_active: Joi.boolean(),
});

const editQuestionSchema = Joi.object({
    text: Joi.string(),
    options: Joi.object({
        a: Joi.string(),
        b: Joi.string(),
        c: Joi.string(),
        d: Joi.string()
    }),
    correct: Joi.string().valid('a', 'b', 'c', 'd'),
    modul: objectId,
    createdBy: objectId,
    validated: Joi.boolean(),
    validated_by: objectId,
    validated_at: Joi.date(),
    validation_comment: Joi.string(),
    user_agreement: Joi.object({
        agreed: Joi.boolean(),
        comment: Joi.string(),
        responded_at: Joi.date(),
    }),
    rating_stats: Joi.object({
        average_rating: Joi.number(),
        total_ratings: Joi.number(),
    }),
    is_active: Joi.boolean(),
});

module.exports = {
    createQuestionSchema,
    editQuestionSchema,
};