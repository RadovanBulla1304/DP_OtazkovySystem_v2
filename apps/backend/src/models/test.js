const mongoose = require("mongoose")

const TestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: { type: String, trim: true },
        total_questions: {
            type: Number,
            required: true,
            min: 1,
        },
        date_start: {
            type: Date,
            required: true,
        },
        date_end: {
            type: Date,
            required: true,
        },
        time_limit: {
            type: Number,
            default: 30,
            min: 1,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        selected_modules: [
            {
                // Modules from which questions will be selected
                type: mongoose.Schema.Types.ObjectId,
                ref: "Module",
                required: true,
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        is_published: {
            type: Boolean,
            default: false,
        },
        max_attempts: {
            type: Number,
            default: 1,
            min: 1,
        },
        passing_score: {
            type: Number,
            default: 60,
            min: 0,
            max: 100,
        },
        max_points: {
            type: Number,
            required: true,
            min: 1,
            default: 10,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Indexes
TestSchema.index({ subject: 1, isPublished: 1 })
TestSchema.index({ createdBy: 1 })
TestSchema.index({ date_start: 1, date_end: 1 })

// Virtual for test duration
TestSchema.virtual("duration_days").get(function () {
    return Math.ceil((this.date_end - this.date_start) / (1000 * 60 * 60 * 24))
})

module.exports = mongoose.model("Test", TestSchema)
