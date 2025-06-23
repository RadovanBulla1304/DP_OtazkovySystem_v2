const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        date_start: {
            type: Date,
            required: true
        },
        date_end: {
            type: Date,
            required: true
        },
        subject: { // RELATION to Subject
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },
        createdBy: { // Teacher
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },
        //Each module can have validatedQuestions
        validatedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "ValidatedQuestion" }]

    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Add virtual for duration (optional)
ModuleSchema.virtual("duration_days").get(function () {
    return Math.ceil((this.date_end - this.date_start) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Module", ModuleSchema);