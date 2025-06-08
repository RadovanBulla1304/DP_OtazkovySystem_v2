const { throwError } = require("../util/universal");
const { validate, validated } = require("../util/validation");
const { createQuestion, editQuestion } = require("../schemas/question.schema");

const Question = require("../models/question");
const Module = require("../models/modul");

// CREATE a new question
exports.createQuestion = [
    validate(createQuestion),
    async (req, res) => {
        try {
            const data = validated(req);

            // Create and save the question
            const question = new Question(data);
            await question.save();

            // Add question to the module's questions array
            await Module.findByIdAndUpdate(data.modul, { $push: { questions: question._id } });

            res.status(201).json(question);
        } catch (err) {
            throwError(`Error creating question: ${err.message}`, 500);
        }
    }
];

// EDIT a question
exports.editQuestion = [
    validate(editQuestion),
    async (req, res) => {
        try {
            const data = validated(req);
            const question = await Question.findById(req.params.id);
            if (!question) {
                return res.status(404).json({ message: "Question not found." });
            }

            // Update fields
            Object.assign(question, data);
            await question.save();

            res.status(200).json(question);
        } catch (err) {
            throwError(`Error editing question: ${err.message}`, 500);
        }
    }
];

// DELETE a question
exports.deleteQuestion = [
    async (req, res) => {
        try {
            const question = await Question.findByIdAndDelete(req.params.id);
            if (!question) {
                return res.status(404).json({ message: "Question not found." });
            }

            // Remove question from module's questions array
            await Module.findByIdAndUpdate(question.modul, { $pull: { questions: question._id } });

            res.status(200).json({ message: "Question deleted." });
        } catch (err) {
            throwError(`Error deleting question: ${err.message}`, 500);
        }
    }
];