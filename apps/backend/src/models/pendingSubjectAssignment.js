const mongoose = require("mongoose")

const PendingSubjectAssignmentSchema = new mongoose.Schema(
    {
        studentNumber: {
            type: Number,
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        // Optional CSV metadata for admin reference
        csvName: {
            type: String,
            trim: true,
        },
        csvSurname: {
            type: String,
            trim: true,
        },
        csvGroup: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
)

// Compound index to prevent duplicate pending assignments
PendingSubjectAssignmentSchema.index({ studentNumber: 1, subject: 1 }, { unique: true })

// Index for efficient lookup on registration
PendingSubjectAssignmentSchema.index({ studentNumber: 1 })

// TTL index - MongoDB will automatically remove expired documents
PendingSubjectAssignmentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("PendingSubjectAssignment", PendingSubjectAssignmentSchema)
