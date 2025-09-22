const mongoose = require("mongoose")

const ForumQuestionSchema = new mongoose.Schema(
    {
        header: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        modul: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Track who liked/disliked as simple user ObjectId arrays (one entry per user)
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        // Cached counts for performance
        likes_count: { type: Number, default: 0 },
        dislikes_count: { type: Number, default: 0 },
        comments_count: { type: Number, default: 0 },

        is_pinned: { type: Boolean, default: false },
        is_closed: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Indexes
ForumQuestionSchema.index({ modul: 1, created_at: -1 })
ForumQuestionSchema.index({ createdBy: 1 })
ForumQuestionSchema.index({ tags: 1 })
ForumQuestionSchema.index({ is_pinned: -1, created_at: -1 })

// Virtual for comments
ForumQuestionSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "forumQuestion",
})

module.exports = mongoose.model("ForumQuestion", ForumQuestionSchema)
