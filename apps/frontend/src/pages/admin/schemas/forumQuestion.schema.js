import Joi from 'joi';

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

export const createForumQuestionSchema = Joi.object({
    header: Joi.string().required(),
    desctription: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    modul: objectId,
    created_by: objectId,
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
    is_pinned: Joi.boolean().default(false),
    is_closed: Joi.boolean().default(false),
});

export const updateForumQuestionSchema = Joi.object({
    header: Joi.string(),
    desctription: Joi.string(),
    tags: Joi.array().items(Joi.string()),
    modul: objectId,
    created_by: objectId,
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
    is_pinned: Joi.boolean().default(false),
    is_closed: Joi.boolean().default(false),
});
