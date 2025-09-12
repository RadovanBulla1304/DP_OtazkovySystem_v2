const { throwError } = require("../util/universal");
const { validate, validated } = require("../util/validation");
const { createQuestionSchema, editQuestionSchema } = require("../schemas/question.schema");

const Question = require("../models/question");
const Module = require("../models/modul");
/**
 * GET all questions
 */
exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (err) {
        throwError(`Error fetching questions: ${err.message}`, 500);
    }
};
/**
 * GET question by ID
 */
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }
        res.status(200).json(question);
    } catch (err) {
        throwError(`Error fetching question: ${err.message}`, 500);
    }
};
/**
 * GET questions by user ID (createdBy)
 */
exports.getQuestionsByUserId = async (req, res) => {
    try {
        const questions = await Question.find({ createdBy: req.params.userId });
        res.status(200).json(questions);
    } catch (err) {
        throwError(`Error fetching questions by user: ${err.message}`, 500);
    }
};
/**
 * GET questions by module ID
 */
exports.getQuestionsByModuleId = async (req, res) => {
    try {
        const questions = await Question.find({ modul: req.params.moduleId });
        res.status(200).json(questions);
    } catch (err) {
        throwError(`Error fetching questions by module: ${err.message}`, 500);
    }
};

/**
 * GET questions by subject ID
 */
exports.getQuestionsBySubjectId = async (req, res) => {
    try {
        // Find modules with the given subject ID
        const modules = await Module.find({ subject: req.params.subjectId }).select('_id');
        const moduleIds = modules.map(m => m._id);

        // Find questions in those modules
        const questions = await Question.find({ modul: { $in: moduleIds } });
        res.status(200).json(questions);
    } catch (err) {
        throwError(`Error fetching questions by subject: ${err.message}`, 500);
    }
};
// CREATE a new question
exports.createQuestion = [
    validate(createQuestionSchema),
    async (req, res) => {
        try {
            const data = validated(req);

            // Create and save the question
            const question = new Question(data);
            await question.save();

            res.status(201).json(question);
        } catch (err) {
            throwError(`Error creating question: ${err.message}`, 500);
        }
    }
];

// EDIT a question
exports.editQuestion = [
    validate(editQuestionSchema),
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