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

        // Track who liked/disliked
        likes: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        dislikes: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Cached counts for performance
        likesCount: { type: Number, default: 0 },
        dislikesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },

        isPinned: { type: Boolean, default: false },
        isClosed: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Indexes
ForumQuestionSchema.index({ modul: 1, createdAt: -1 })
ForumQuestionSchema.index({ createdBy: 1 })
ForumQuestionSchema.index({ tags: 1 })
ForumQuestionSchema.index({ isPinned: -1, createdAt: -1 })

// Virtual for comments
ForumQuestionSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "forumQuestion",
})

module.exports = mongoose.model("ForumQuestion", ForumQuestionSchema)
