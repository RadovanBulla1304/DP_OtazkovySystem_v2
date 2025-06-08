const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        options: {
            a: { type: String, required: true },
            b: { type: String, required: true },
            c: { type: String, required: true },
            d: { type: String, required: true }
        },
        correct: {
            type: String,
            enum: ['a', 'b', 'c', 'd'],
            required: true
        }, // Only one correct, must be 'a', 'b', 'c', or 'd'
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

module.exports = mongoose.model("Question", QuestionSchema);