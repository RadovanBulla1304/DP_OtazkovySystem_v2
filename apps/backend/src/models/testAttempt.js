const mongoose = require("mongoose")

const TestAttemptSchema = new mongoose.Schema(
    {
        test: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Test",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questions: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true,
                },
                selectedAnswer: {
                    type: String,
                    enum: ["a", "b", "c", "d"],
                    required: true,
                },
                isCorrect: {
                    type: Boolean,
                    required: true,
                },
                timeSpent: {
                    // in seconds
                    type: Number,
                    default: 0,
                },
            },
        ],
        startedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        submittedAt: {
            type: Date,
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
        },
        passed: {
            type: Boolean,
            default: false,
        },
        totalTimeSpent: {
            // in seconds
            type: Number,
            default: 0,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
TestAttemptSchema.index({ test: 1, user: 1 })
TestAttemptSchema.index({ user: 1, submittedAt: -1 })
TestAttemptSchema.index({ test: 1, isCompleted: 1 })

module.exports = mongoose.model("TestAttempt", TestAttemptSchema)
