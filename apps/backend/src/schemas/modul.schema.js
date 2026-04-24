const Joi = require("joi");
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createModulSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    week_number: Joi.number().min(1),
    date_start: Joi.date().iso().required(),
    date_end: Joi.date().iso().greater(Joi.ref('date_start')).required(),
    week2_start: Joi.date().iso().optional(),
    week3_start: Joi.date().iso().optional(),
    subject: objectId.required(),
    createdBy: objectId.required(),
    is_active: Joi.boolean().default(true),
    required_questions_per_user: Joi.number(),
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
    week2_start: Joi.date().iso().allow(null).optional(),
    week3_start: Joi.date().iso().allow(null).optional(),
    subject: objectId,
    createdBy: objectId,
    is_active: Joi.boolean(),
    required_questions_per_user: Joi.number(),
});

module.exports = {
    createModulSchema,
    editModulSchema
};