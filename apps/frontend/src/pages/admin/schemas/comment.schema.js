import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const createCommentSchema = Joi.object({
    content: Joi.string(),
    forum_question: objectId.required(),
    createdBy: objectId.required(),
    createdByName: Joi.string().allow(null).optional(),
    parent: objectId.required(),
    likes: Joi.array().items(
        Joi.object({
            user: objectId.required(),
            created_at: Joi.date()
        })
    ),
    dislikes: Joi.array().items(
        Joi.object({
            user: objectId.required(),
            created_at: Joi.date()
        })
    ),
    is_edited: Joi.boolean().default(false),
    edited_at: Joi.date(),
});

export const updateCommentSchema = Joi.object({
    content: Joi.string(),
    forum_question: objectId,
    createdBy: objectId,
    createdByName: Joi.string().allow(null).optional(),
    parent: objectId,
    likes: Joi.array().items(
        Joi.object({
            user: objectId,
            created_at: Joi.date()
        })
    ),
    dislikes: Joi.array().items(
        Joi.object({
            user: objectId,
            created_at: Joi.date()
        })
    ),
    is_edited: Joi.boolean().default(false),
    edited_at: Joi.date(),
});
