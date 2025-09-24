const mongoose = require("mongoose")

const PointSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assigned_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
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
                "question_validation",
                "question_reparation",
                "test_performance",
                "forum_participation",
                "project_work",
                "other",
            ],
            default: "other",
        },
        related_entity: {
            entity_type: {
                type: String,
                enum: ["Question", "Test", "ForumQuestion", "Project"],
            },
            entity_id: {
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
PointSchema.index({ assigned_by: 1 })
PointSchema.index({ category: 1 })

module.exports = mongoose.model("Point", PointSchema)
