const mongoose = require("mongoose")

const QuestionRatingSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        questionCreator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ratedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },

        // Creator's response to this rating
        creatorResponse: {
            agreed: { type: Boolean },
            comment: { type: String, trim: true },
            respondedAt: { type: Date },
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
QuestionRatingSchema.index({ question: 1 })
QuestionRatingSchema.index({ questionCreator: 1 })
QuestionRatingSchema.index({ ratedBy: 1 })

// Prevent duplicate ratings
QuestionRatingSchema.index({ question: 1, ratedBy: 1 }, { unique: true })

module.exports = mongoose.model("QuestionRating", QuestionRatingSchema)
