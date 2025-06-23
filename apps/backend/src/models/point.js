const mongoose = require("mongoose");

const PointSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Teacher who gave the points
            required: true,
        },
        reason: { type: String, required: true }, //reason/description why points were given
        points: { type: Number, required: true }, //Number of points given
    },
    { timestamps: true }
);

module.exports = mongoose.model("Point", PointSchema);
