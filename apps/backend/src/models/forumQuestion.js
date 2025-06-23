const mongoose = require("mongoose");

const ForumQuestionSchema = new mongoose.Schema(
    {
        header: { type: String, required: true }, // Title of the question
        description: { type: String, required: true },
        likes: { type: Number, default: 0 }, // Number of likes for the question
        dislikes: { type: Number, default: 0 }, // Number of dislikes for the
        modul: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

module.exports = mongoose.model("ForumQuestion", ForumQuestionSchema);