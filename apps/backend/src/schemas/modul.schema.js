const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const createModulSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    week_number: Joi.number().min(1).required(),
    date_start: Joi.date().iso().required(),
    date_end: Joi.date().iso().greater(Joi.ref('date_start')).required(),
    subject: objectId.required(), // Valid MongoDB ObjectId
    created_by: objectId,
    required_questions_per_user: Joi.number().default(2),
});

const editModulSchema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    week_number: Joi.number().min(1),
    date_start: Joi.date().iso(),
    date_end: Joi.date().iso().when('date_start', {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref('date_start')),
        otherwise: Joi.date()
    }),
    subject: objectId,
    created_by: objectId,
    required_questions_per_user: Joi.number().default(2),

});

module.exports = {
    createModulSchema,
    editModulSchema
};