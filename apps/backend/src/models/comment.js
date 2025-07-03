const mongoose = require("mongoose")

const CommentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        forumQuestion: {
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
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        likesCount: { type: Number, default: 0 },

        isEdited: { type: Boolean, default: false },
        editedAt: { type: Date },
    },
    {
        timestamps: true,
    },
)

// Indexes
CommentSchema.index({ forumQuestion: 1, parent: 1, createdAt: 1 })
CommentSchema.index({ createdBy: 1 })
CommentSchema.index({ parent: 1 })

// Virtual for replies
CommentSchema.virtual("replies", {
    ref: "Comment",
    localField: "_id",
    foreignField: "parent",
})

module.exports = mongoose.model("Comment", CommentSchema)
