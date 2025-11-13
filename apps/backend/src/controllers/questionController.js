const { throwError } = require("../util/universal");
const { validate, validated } = require("../util/validation");
const { createQuestionSchema, editQuestionSchema } = require("../schemas/question.schema");

const Question = require("../models/question");
const Module = require("../models/modul");
const User = require("../models/user");
const Teacher = require("../models/teacher");
const Point = require("../models/point");
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
exports.getQuestionByUserId = async (req, res) => {
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

            // Award point immediately for question creation
            try {
                const point = new Point({
                    student: question.createdBy,
                    reason: `Question created: ${question.text.substring(0, 50)}...`,
                    points: 1,
                    category: 'question_creation',
                    related_entity: {
                        entity_type: 'Question',
                        entity_id: question._id
                    }
                });
                await point.save();

                // Mark question as awarded
                question.pointsAwarded.creation = true;
                await question.save();

                // Add point to user's points array
                await User.findByIdAndUpdate(
                    question.createdBy,
                    { $push: { points: point._id } }
                );
            } catch (pointError) {
                // Don't fail the question creation if point awarding fails
            }

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


        // Validate input
        if (typeof valid !== 'boolean') {
            return res.status(400).json({ message: "Valid field must be a boolean." });
        }

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }

        // Update question with validation info
        question.validated = valid;
        question.validation_comment = comment || '';
        question.validated_at = new Date();
        const validatorId = req.user?.user_id || req.user?.id || req.user?._id || null;
        question.validated_by = validatorId;

        await question.save();

        // Award point immediately for question validation
        if (validatorId && !question.pointsAwarded.validation) {
            try {
                const point = new Point({
                    student: validatorId,
                    reason: `Question validated: ${question.text.substring(0, 50)}...`,
                    points: 1,
                    category: 'question_validation',
                    related_entity: {
                        entity_type: 'Question',
                        entity_id: question._id
                    }
                });
                await point.save();

                // Mark question as awarded
                question.pointsAwarded.validation = true;
                await question.save();

                // Add point to user's points array
                await User.findByIdAndUpdate(
                    validatorId,
                    { $push: { points: point._id } }
                );
            } catch (pointError) {
                // Don't fail the validation if point awarding fails
            }
        }

        res.status(200).json({
            message: "Question validation saved successfully.",
            question: question
        });
    } catch (err) {
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

        // Award point immediately for question reparation (responding to validation)
        if (!question.pointsAwarded.reparation) {
            try {
                const point = new Point({
                    student: question.createdBy,
                    reason: `Responded to validation: ${question.text.substring(0, 50)}...`,
                    points: 1,
                    category: 'question_reparation',
                    related_entity: {
                        entity_type: 'Question',
                        entity_id: question._id
                    }
                });
                await point.save();

                // Mark question as awarded
                question.pointsAwarded.reparation = true;
                await question.save();

                // Add point to user's points array
                await User.findByIdAndUpdate(
                    question.createdBy,
                    { $push: { points: point._id } }
                );
            } catch (pointError) {
                // Don't fail the response if point awarding fails
            }
        }

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

        // Get filter from query params (all, student, teacher)
        const filter = req.query.filter || 'all';

        // Build query based on filter
        let query = {
            modul: { $in: moduleIds },
            validated: true
        };

        if (filter === 'student') {
            // Only student questions with user agreement
            const students = await User.find({}).select('_id');
            const studentIds = students.map(s => s._id);
            query.createdBy = { $in: studentIds };
            query['user_agreement.agreed'] = true;
        } else if (filter === 'teacher') {
            // Only teacher-created questions
            const teachers = await Teacher.find({}).select('_id');
            const teacherIds = teachers.map(t => t._id);
            query.createdBy = { $in: teacherIds };
            query.validated_by_teacher = true;
        } else {
            // All: both student questions with agreement OR teacher questions
            query.$or = [
                { 'user_agreement.agreed': true },
                { 'validated_by_teacher': true }
            ];
        }

        // Find questions that match the filter
        const questions = await Question.find(query)
            .populate('modul', 'title ')
            .populate('createdBy', 'name surname email')
            .populate('validated_by', 'name surname email')
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

        // Update question with teacher validation info
        question.validated_by_teacher = validated_by_teacher;
        question.validated_by_teacher_comment = validated_by_teacher_comment.trim();
        question.validated_by_teacher_at = new Date();

        await question.save();

        res.status(200).json({
            message: "Teacher validation saved successfully.",
            question: question
        });
    } catch (err) {
        throwError(`Error in teacher validation: ${err.message}`, 500);
    }
};