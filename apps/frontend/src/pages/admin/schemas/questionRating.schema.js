import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const createQuestionRating = Joi.object({
    question: objectId.required(),
    question_creator: objectId.required(),
    rated_by: objectId.required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().required(),
    creator_response: Joi.object({
        agreed: Joi.boolean(),
        comment: Joi.string(),
        responded_at: Joi.date()
    })
});

export const editQuestionRating = Joi.object({
    question: objectId,
    question_creator: objectId,
    rated_by: objectId,
    rating: Joi.number().integer().min(1).max(5),
    comment: Joi.string(),
    creator_response: Joi.object({
        agreed: Joi.boolean(),
        comment: Joi.string(),
        responded_at: Joi.date()
    })
});
