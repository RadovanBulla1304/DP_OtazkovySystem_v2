const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        assignedUsers: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] }, // Array of assigned users
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model("Subject", SubjectSchema);