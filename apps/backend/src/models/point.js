const mongoose = require("mongoose")

const PointSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        points: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            enum: [
                "question_creation",
                "question_rating",
                "test_performance",
                "forum_participation",
                "project_work",
                "other",
            ],
            default: "other",
        },
        relatedEntity: {
            entityType: {
                type: String,
                enum: ["Question", "Test", "ForumQuestion", "Project"],
            },
            entityId: {
                type: mongoose.Schema.Types.ObjectId,
            },
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
PointSchema.index({ student: 1, createdAt: -1 })
PointSchema.index({ assignedBy: 1 })
PointSchema.index({ category: 1 })

module.exports = mongoose.model("Point", PointSchema)
