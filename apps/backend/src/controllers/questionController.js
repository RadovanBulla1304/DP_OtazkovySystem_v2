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
            const question = await Question.findById(req.params.id).populate('modul');
            if (!question) {
                return res.status(404).json({ message: "Question not found." });
            }

            // Update only the allowed fields for editing (text, options, correct)
            const allowedUpdates = {};
            if (data.text !== undefined) allowedUpdates.text = data.text;
            if (data.options !== undefined) allowedUpdates.options = data.options;
            if (data.correct !== undefined) allowedUpdates.correct = data.correct;

            // Update fields
            Object.assign(question, allowedUpdates);
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

/**
 * VALIDATE a question (Week 2 functionality)
 */
exports.validateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { valid, comment } = req.body;

        console.log('Validate question called:', { id, valid, comment, user: req.user }); // Debug log

        // Validate input
        if (typeof valid !== 'boolean') {
            return res.status(400).json({ message: "Valid field must be a boolean." });
        }

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }

        console.log('Question found before update:', question.toObject()); // Debug log

        // Update question with validation info
        question.validated = valid;
        question.validation_comment = comment || '';
        question.validated_at = new Date();
        question.validated_by = req.user?.user_id || req.user?.id || req.user?._id || null; // Fixed to use user_id from auth middleware

        await question.save();

        console.log('Question after update:', question.toObject()); // Debug log

        res.status(200).json({
            message: "Question validation saved successfully.",
            question: question
        });
    } catch (err) {
        console.error('Error in validateQuestion:', err); // Debug log
        throwError(`Error validating question: ${err.message}`, 500);
    }
};

/**
 * RESPOND to question validation (Week 3 functionality)  
 */
exports.respondToValidation = async (req, res) => {
    try {
        const { id } = req.params;
        const { agreed, comment } = req.body;

        // Validate input
        if (typeof agreed !== 'boolean') {
            return res.status(400).json({ message: "Agreed field must be a boolean." });
        }

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }

        // Update question with user's response to validation
        question.user_agreement = {
            agreed: agreed,
            comment: comment || '',
            responded_at: new Date()
        };

        await question.save();

        res.status(200).json({
            message: "Response to validation saved successfully.",
            question: question
        });
    } catch (err) {
        throwError(`Error saving validation response: ${err.message}`, 500);
    }
};

/**
 * GET validated questions with user agreement by subject ID
 */
exports.getValidatedQuestionsWithAgreementBySubject = async (req, res) => {
    try {
        // Find modules with the given subject ID
        const modules = await Module.find({ subject: req.params.subjectId }).select('_id');
        const moduleIds = modules.map(m => m._id);

        // Find questions that are validated and have user agreement
        const questions = await Question.find({
            modul: { $in: moduleIds },
            validated: true,
            'user_agreement.agreed': true
        })
            .populate('modul', 'name')
            .populate('createdBy', 'name surname email')
            .populate('validated_by', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json(questions);
    } catch (err) {
        throwError(`Error fetching validated questions with agreement: ${err.message}`, 500);
    }
};

/**
 * TEACHER VALIDATE a question - separate from regular validation
 */
exports.teacherValidateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { validated_by_teacher, validated_by_teacher_comment } = req.body;

        console.log('Teacher validate question called:', {
            id,
            validated_by_teacher,
            validated_by_teacher_comment,
            user: req.user
        }); // Debug log

        // Validate input
        if (typeof validated_by_teacher !== 'boolean') {
            return res.status(400).json({ message: "validated_by_teacher field must be a boolean." });
        }

        if (!validated_by_teacher_comment || validated_by_teacher_comment.trim().length === 0) {
            return res.status(400).json({ message: "Teacher validation comment is required." });
        }

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }

        console.log('Question found before teacher validation update:', question.toObject()); // Debug log

        // Update question with teacher validation info
        question.validated_by_teacher = validated_by_teacher;
        question.validated_by_teacher_comment = validated_by_teacher_comment.trim();
        question.validated_by_teacher_at = new Date();

        await question.save();

        console.log('Question after teacher validation update:', question.toObject()); // Debug log

        res.status(200).json({
            message: "Teacher validation saved successfully.",
            question: question
        });
    } catch (err) {
        console.error('Error in teacherValidateQuestion:', err); // Debug log
        throwError(`Error in teacher validation: ${err.message}`, 500);
    }
};