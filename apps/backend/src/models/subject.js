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

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },

        assigned_teachers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Teacher",
            },
        ],

        assigned_students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        is_active: { type: Boolean, default: true },

        // Array of module references
        moduls: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Module",
            },
        ],
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
SubjectSchema.index({ assigned_teachers: 1 })
SubjectSchema.index({ assigned_students: 1 })

// Virtual for modules
SubjectSchema.virtual("modules", {
    ref: "Module",
    localField: "_id",
    foreignField: "subject",
})

module.exports = mongoose.model("Subject", SubjectSchema)
