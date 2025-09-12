const mongoose = require("mongoose")

const CommentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        forum_question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ForumQuestion",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },

        // Track likes on comments
        likes: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                created_at: {
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
                created_at: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        likes_count: { type: Number, default: 0 },
        dislikes_count: { type: Number, default: 0 },

        is_edited: { type: Boolean, default: false },
        edited_at: { type: Date },
    },
    {
        timestamps: true,
    },
)

// Indexes
CommentSchema.index({ forum_question: 1, parent: 1, created_at: 1 })
CommentSchema.index({ createdBy: 1 })
CommentSchema.index({ parent: 1 })

// Virtual for replies
CommentSchema.virtual("replies", {
    ref: "Comment",
    localField: "_id",
    foreignField: "parent",
})

module.exports = mongoose.model("Comment", CommentSchema)
