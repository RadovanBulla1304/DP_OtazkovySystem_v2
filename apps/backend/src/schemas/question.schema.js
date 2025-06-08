const Joi = require("joi");

const createQuestion = Joi.object({
    text: Joi.string().required(), // Question text is required
    options: Joi.object({
        a: Joi.string().required(),
        b: Joi.string().required(),
        c: Joi.string().required(),
        d: Joi.string().required()
    }).required(),
    correct: Joi.string().valid('a', 'b', 'c', 'd').required(), // Only one correct, must be 'a', 'b', 'c', or 'd'
    modul: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Module ObjectId
    createdBy: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional() // User ObjectId (optional)
});

const editQuestion = Joi.object({
    text: Joi.string(),
    options: Joi.object({
        a: Joi.string(),
        b: Joi.string(),
        c: Joi.string(),
        d: Joi.string()
    }),
    correct: Joi.string().valid('a', 'b', 'c', 'd'),
    modul: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    createdBy: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
});

module.exports = {
    createQuestion,
    editQuestion,
};