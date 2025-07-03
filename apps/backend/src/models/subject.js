const mongoose = require("mongoose")

const SubjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        }, // Subject code like "MATH101"
        description: { type: String, trim: true },

        assignedTeachers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Teacher",
            },
        ],

        assignedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Indexes
SubjectSchema.index({ name: 1 })
SubjectSchema.index({ code: 1 })
SubjectSchema.index({ assignedTeachers: 1 })
SubjectSchema.index({ assignedStudents: 1 })

// Virtual for modules
SubjectSchema.virtual("modules", {
    ref: "Module",
    localField: "_id",
    foreignField: "subject",
})

module.exports = mongoose.model("Subject", SubjectSchema)
