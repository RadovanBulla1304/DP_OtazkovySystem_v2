const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createPointSchema = Joi.object({
    student: objectId.required(),
    assigned_by: objectId.required(),
    reason: Joi.string().required(),
    points: Joi.number().required(),
    category: Joi.string().valid("question_creation",
        "question_rating",
        "test_performance",
        "forum_participation",
        "project_work",
        "other").default("other").required(),
    related_entity: {
        entity_type: Joi.string().valid("Question", "Test", "ForumQuestion", "Project").required(),
        entity_id: objectId.required(),
    }
});

const updatePointSchema = Joi.object({
    student: objectId,
    assigned_by: objectId,
    reason: Joi.string(),
    points: Joi.number(),
    category: Joi.string().valid("question_creation",
        "question_rating",
        "test_performance",
        "forum_participation",
        "project_work",
        "other").default("other"),
    related_entity: {
        entity_type: Joi.string().valid("Question", "Test", "ForumQuestion", "Project").required(),
        entity_id: objectId,
    }
});

module.exports = {
    createPointSchema,
    updatePointSchema,
};