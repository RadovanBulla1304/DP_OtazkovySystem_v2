const mongoose = require("mongoose")

const ProjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        assignedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
        },
        dueDate: { type: Date },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
        maxMembers: {
            type: Number,
            default: 5,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
)

// Indexes
ProjectSchema.index({ assignedUsers: 1 })
ProjectSchema.index({ createdBy: 1 })
ProjectSchema.index({ subject: 1 })
ProjectSchema.index({ status: 1, dueDate: 1 })

module.exports = mongoose.model("Project", ProjectSchema)
