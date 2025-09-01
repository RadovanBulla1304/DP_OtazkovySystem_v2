const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

const createCommentSchema = Joi.object({
    content: Joi.string(),
    forum_question: objectId.required(),
    created_by: objectId.required(),
    parent: objectId.required(),
    likes: Joi.array({
        user: objectId.required(),
        created_at: Joi.date()
    }),
    dislikes: Joi.array({
        user: objectId.required(),
        created_at: Joi.date()
    }),
    is_edited: Joi.boolean().default(false),
    edited_at: Joi.date(),
});

const updateCommentSchema = Joi.object({
    content: Joi.string(),
    forum_question: objectId,
    created_by: objectId,
    parent: objectId,
    likes: Joi.array({
        user: objectId,
        created_at: Joi.date()
    }),
    dislikes: Joi.array({
        user: objectId,
        created_at: Joi.date()
    }),
    is_edited: Joi.boolean().default(false),
    edited_at: Joi.date(),
});

module.exports = {
    createCommentSchema,
    updateCommentSchema,
};