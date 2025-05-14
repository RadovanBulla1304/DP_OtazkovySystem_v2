const Joi = require("joi");

const createModul = Joi.object({
    title: Joi.string().required(),
    date_start: Joi.date().iso().required(),
    date_end: Joi.date().iso().greater(Joi.ref('date_start')).required(),
    subject: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Valid MongoDB ObjectId
    createdBy: Joi.string().regex(/^[0-9a-fA-F]{24}$/) // Optional creator reference
});

const editModul = Joi.object({
    title: Joi.string(),
    date_start: Joi.date().iso(),
    date_end: Joi.date().iso().when('date_start', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('date_start')),
        otherwise: Joi.date()
    }),
    deleted: Joi.boolean(),
    subject: Joi.string().regex(/^[0-9a-fA-F]{24}$/) // Optional subject reference for editing
});

module.exports = {
    createModul,
    editModul
};