const mongoose = require("mongoose");

const ValidatedQuestionSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        options: [{ type: String, required: true }], // or however you store answers
        correctOption: { type: Number, required: true },
        modul: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
        originUserQuestion: { type: mongoose.Schema.Types.ObjectId, ref: "Question" }, // optional link to original user-created Question
    },
    { timestamps: true }
);

module.exports = mongoose.model("ValidatedQuestion", ValidatedQuestionSchema);
