const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },

        assignedTeachers: [{ // Teachers teaching this subject
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            default: []
        }],

        assignedStudents: [{ // Users (students) participating
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }],

        modules: [{ // Modules in the subject
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            default: []
        }]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

module.exports = mongoose.model("Subject", SubjectSchema);
