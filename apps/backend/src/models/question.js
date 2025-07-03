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
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
        },
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
        validated: { type: Boolean, default: false },
        validatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
        },
        validatedAt: { type: Date },
        validationComment: { type: String, trim: true },

        // User's response to validation
        userAgreement: {
            agreed: { type: Boolean },
            comment: { type: String, trim: true },
            respondedAt: { type: Date },
        },

        // Rating statistics (cached for performance)
        ratingStats: {
            averageRating: { type: Number, default: 0 },
            totalRatings: { type: Number, default: 0 },
        },

        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Indexes
QuestionSchema.index({ modul: 1, createdBy: 1 })
QuestionSchema.index({ validated: 1, modul: 1 })
QuestionSchema.index({ createdBy: 1, createdAt: -1 })
QuestionSchema.index({ "ratingStats.averageRating": -1 })

// Compound index for weekly question tracking
QuestionSchema.index({
    createdBy: 1,
    modul: 1,
    createdAt: -1,
})

module.exports = mongoose.model("Question", QuestionSchema)
