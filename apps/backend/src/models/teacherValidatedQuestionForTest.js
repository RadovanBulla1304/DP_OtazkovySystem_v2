const mongoose = require("mongoose")

const TeacherValidatedQuestionForTestSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        test: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Test",
            required: true,
        },
        modul: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
TeacherValidatedQuestionForTestSchema.index({ test: 1, modul: 1 })
TeacherValidatedQuestionForTestSchema.index({ question: 1, test: 1 }, { unique: true }) // Prevent duplicate questions in same test
TeacherValidatedQuestionForTestSchema.index({ modul: 1 })

module.exports = mongoose.model("TeacherValidatedQuestionForTest", TeacherValidatedQuestionForTestSchema)
