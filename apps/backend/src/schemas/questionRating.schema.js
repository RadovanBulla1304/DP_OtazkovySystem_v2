const Joi = require("joi");

const createQuestionRating = Joi.object({
    question: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Question ObjectId
    questionCreator: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // User ObjectId
    ratedBy: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // User ObjectId
    rating: Joi.number().integer().min(1).max(5).required(), // Rating value
    comment: Joi.string().required() // Comment is required
});

const editQuestionRating = Joi.object({
    rating: Joi.number().integer().min(1).max(5),
    comment: Joi.string(),
});

module.exports = {
    createQuestionRating,
    editQuestionRating,
};