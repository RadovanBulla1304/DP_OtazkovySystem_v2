const mongoose = require("mongoose");

/**
 * QuestionAssignment tracks which questions are assigned to which users for validation in Week 2
 * This ensures consistent assignments and prevents questions from changing when users refresh
 */
const QuestionAssignmentSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        modul: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true
        },
        weekNumber: {
            type: Number,
            default: 2  // For Week 2 validation assignments
        },
        assignedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Indexes for efficient querying
QuestionAssignmentSchema.index({ assignedTo: 1, modul: 1, weekNumber: 1 });
QuestionAssignmentSchema.index({ question: 1 });

module.exports = mongoose.model("QuestionAssignment", QuestionAssignmentSchema);
