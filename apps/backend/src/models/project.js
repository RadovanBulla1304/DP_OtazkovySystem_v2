const mongoose = require("mongoose");
const ProjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
