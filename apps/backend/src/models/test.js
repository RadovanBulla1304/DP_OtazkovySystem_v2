const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        total_questions: {
            type: Number,
            required: true,
            min: 1
        },
        date_start: {
            type: Date,
            required: true
        },
        date_end: {
            type: Date,
            required: true
        },
        time_limit: {  // in minutes
            type: Number,
            default: 30
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },
        module: {  // Optional link to specific module
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module"
        },
        questions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        isPublished: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for test duration (optional)
TestSchema.virtual("duration_days").get(function () {
    return Math.ceil((this.date_end - this.date_start) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Test", TestSchema);