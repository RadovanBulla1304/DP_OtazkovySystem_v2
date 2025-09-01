const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const createQuestionRating = Joi.object({
    question: objectId.required(), // Question ObjectId
    question_creator: objectId.required(), // User ObjectId
    rated_by: objectId.required(), // User ObjectId
    rating: Joi.number().integer().min(1).max(5).required(), // Rating value
    comment: Joi.string().required(), // Comment is required
    creator_response: {
        agreed: Joi.boolean(),
        comment: Joi.string(),
        responded_at: Joi.date()
    }
});

const editQuestionRating = Joi.object({
    question: objectId, // Question ObjectId
    question_creator: objectId, // User ObjectId
    rated_by: objectId, // User ObjectId
    rating: Joi.number().integer().min(1).max(5), // Rating value
    comment: Joi.string(), // Comment is required
    creator_response: {
        agreed: Joi.boolean(),
        comment: Joi.string(),
        responded_at: Joi.date()
    }
});

module.exports = {
    createQuestionRating,
    editQuestionRating,
};