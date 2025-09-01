const mongoose = require("mongoose")

const QuestionRatingSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        question_creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rated_by: {
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
        creator_response: {
            agreed: { type: Boolean },
            comment: { type: String, trim: true },
            responded_at: { type: Date },
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
QuestionRatingSchema.index({ question: 1 })
QuestionRatingSchema.index({ question_creator: 1 })
QuestionRatingSchema.index({ rated_by: 1 })

// Prevent duplicate ratings
QuestionRatingSchema.index({ question: 1, rated_by: 1 }, { unique: true })

module.exports = mongoose.model("QuestionRating", QuestionRatingSchema)
