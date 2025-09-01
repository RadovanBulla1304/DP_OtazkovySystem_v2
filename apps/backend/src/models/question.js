const mongoose = require("mongoose")

const QuestionSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
        options: {
            a: { type: String, required: true, trim: true },
            b: { type: String, required: true, trim: true },
            c: { type: String, required: true, trim: true },
            d: { type: String, required: true, trim: true },
        },
        correct: {
            type: String,
            enum: ["a", "b", "c", "d"],
            required: true,
        },
        modul: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        validated: { type: Boolean, default: false },
        validated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
        },
        validated_at: { type: Date },
        validation_comment: { type: String, trim: true },

        // User's response to validation
        user_agreement: {
            agreed: { type: Boolean },
            comment: { type: String, trim: true },
            responded_at: { type: Date },
        },

        // Rating statistics (cached for performance)
        rating_stats: {
            average_rating: { type: Number, default: 0 },
            total_ratings: { type: Number, default: 0 },
        },

        is_active: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Indexes
QuestionSchema.index({ modul: 1, created_by: 1 })
QuestionSchema.index({ validated: 1, modul: 1 })
QuestionSchema.index({ created_by: 1, createdAt: -1 })
QuestionSchema.index({ "rating_stats.average_rating": -1 })

// Compound index for weekly question tracking
QuestionSchema.index({
    created_by: 1,
    modul: 1,
    created_at: -1,
})

module.exports = mongoose.model("Question", QuestionSchema)
