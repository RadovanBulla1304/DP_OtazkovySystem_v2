const mongoose = require("mongoose")

const ModuleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: { type: String, trim: true },
        week_number: {
            type: Number,
            required: true,
            min: 1,
        }, // Week 1, 2, 3, etc.
        date_start: {
            type: Date,
            required: true,
        },
        date_end: {
            type: Date,
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        is_active: { type: Boolean, default: true },
        required_questions_per_user: { type: Number, default: 2 }, // Configurable per module
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Indexes
ModuleSchema.index({ subject: 1, week_number: 1 })
ModuleSchema.index({ date_start: 1, date_end: 1 })
ModuleSchema.index({ created_by: 1 })

// Virtual for duration
ModuleSchema.virtual("duration_days").get(function () {
    return Math.ceil((this.date_end - this.date_start) / (1000 * 60 * 60 * 24))
})

// Virtual for questions
ModuleSchema.virtual("questions", {
    ref: "Question",
    localField: "_id",
    foreignField: "modul",
})

// Virtual for validated questions
ModuleSchema.virtual("validatedQuestions", {
    ref: "Question",
    localField: "_id",
    foreignField: "modul",
    match: { validated: true },
})

module.exports = mongoose.model("Module", ModuleSchema)
