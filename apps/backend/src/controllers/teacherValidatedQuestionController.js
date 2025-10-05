const TeacherValidatedQuestionForTest = require('../models/teacherValidatedQuestionForTest');
const Question = require('../models/question');
const Test = require('../models/test');

// Get all validated questions for a test (filtered by test's selected modules)
const getValidatedQuestionsForTest = async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await Test.findById(testId).populate('selected_modules');
        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        const validatedQuestions = await TeacherValidatedQuestionForTest.find({
            test: testId
        })
            .populate({
                path: 'question',
                populate: {
                    path: 'modul',
                    select: 'name title'
                }
            })
            .populate('modul', 'name title')
            .populate('addedBy', 'name surname email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: validatedQuestions,
            count: validatedQuestions.length
        });
    } catch (error) {
        console.error('Error fetching validated questions for test:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching validated questions',
            error: error.message
        });
    }
};

// Get validated questions by modules (for showing available questions when creating test)
const getValidatedQuestionsByModules = async (req, res) => {
    try {
        const { moduleIds } = req.query; // Comma-separated module IDs

        if (!moduleIds) {
            return res.status(400).json({
                success: false,
                message: 'Module IDs are required'
            });
        }

        const moduleArray = moduleIds.split(',');

        // Get all teacher-validated questions from these modules
        const questions = await Question.find({
            modul: { $in: moduleArray },
            validated: true // Teacher validated
        })
            .populate('modul', 'name title')
            .populate('createdBy', 'username email name surname')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: questions,
            count: questions.length
        });
    } catch (error) {
        console.error('Error fetching validated questions by modules:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching validated questions',
            error: error.message
        });
    }
};

// Add question to test's validated question pool
const addQuestionToTestPool = async (req, res) => {
    try {
        const { testId, questionId } = req.body;
        const teacherId = req.user?.user_id;

        if (!teacherId) {
            return res.status(401).json({
                success: false,
                message: 'Teacher not authenticated'
            });
        }

        if (!testId || !questionId) {
            return res.status(400).json({
                success: false,
                message: 'Test ID and Question ID are required'
            });
        }

        // Verify test exists
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        // Verify question exists and get its module
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if question already exists in test pool
        const existing = await TeacherValidatedQuestionForTest.findOne({
            test: testId,
            question: questionId
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Question already added to this test'
            });
        }

        // Add question to pool
        const validatedQuestion = await TeacherValidatedQuestionForTest.create({
            question: questionId,
            test: testId,
            modul: question.modul,
            addedBy: teacherId
        });

        await validatedQuestion.populate([
            {
                path: 'question',
                populate: { path: 'modul', select: 'name title' }
            },
            { path: 'modul', select: 'name title' },
            { path: 'addedBy', select: 'name surname email' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Question added to test pool successfully',
            data: validatedQuestion
        });
    } catch (error) {
        console.error('Error adding question to test pool:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding question to test pool',
            error: error.message
        });
    }
};

// Remove question from test pool
const removeQuestionFromTestPool = async (req, res) => {
    try {
        const { id } = req.params; // TeacherValidatedQuestionForTest ID

        const deleted = await TeacherValidatedQuestionForTest.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Validated question not found'
            });
        }

        res.json({
            success: true,
            message: 'Question removed from test pool successfully'
        });
    } catch (error) {
        console.error('Error removing question from test pool:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing question from test pool',
            error: error.message
        });
    }
};

// Get count of validated questions available for test
const getValidatedQuestionsCount = async (req, res) => {
    try {
        const { moduleIds } = req.query;

        if (!moduleIds) {
            return res.status(400).json({
                success: false,
                message: 'Module IDs are required'
            });
        }

        const moduleArray = moduleIds.split(',');

        const count = await Question.countDocuments({
            modul: { $in: moduleArray },
            validated: true
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error counting validated questions:', error);
        res.status(500).json({
            success: false,
            message: 'Error counting validated questions',
            error: error.message
        });
    }
};

module.exports = {
    getValidatedQuestionsForTest,
    getValidatedQuestionsByModules,
    addQuestionToTestPool,
    removeQuestionFromTestPool,
    getValidatedQuestionsCount
};
