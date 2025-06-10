const mongoose = require("mongoose");

const QuestionRatingSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },
        questionCreator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        ratedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5 // or whatever scale you want
        },
        comment: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("QuestionRating", QuestionRatingSchema);