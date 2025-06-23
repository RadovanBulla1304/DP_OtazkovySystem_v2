const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },

        forumQuestion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ForumQuestion",
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null // null if top-level comment, else it's a reply to another comment
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Comment", CommentSchema);
