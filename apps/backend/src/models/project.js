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
        assigned_users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
        },
        due_date: { type: Date },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
        max_members: {
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
ProjectSchema.index({ assigned_users: 1 })
ProjectSchema.index({ created_by: 1 })
ProjectSchema.index({ subject: 1 })
ProjectSchema.index({ status: 1, due_date: 1 })

module.exports = mongoose.model("Project", ProjectSchema)
