const Question = require('../models/question');

// Get validated questions for a specific test (legacy, might not be needed)
const getValidatedQuestionsForTest = async (req, res) => {
    try {
        const { testId } = req.params;
        res.json({
            data: []
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching validated questions',
            error: error.message
        });
    }
};

// Get validated questions by modules
const getValidatedQuestionsByModules = async (req, res) => {
    try {
        const { moduleIds } = req.query;

        if (!moduleIds) {
            return res.status(400).json({
                message: 'Module IDs are required'
            });
        }

        // Split comma-separated module IDs
        const moduleIdArray = moduleIds.split(',').filter(id => id.trim());

        if (moduleIdArray.length === 0) {
            return res.json({
                data: []
            });
        }

        // Find all questions that are validated by teacher in the selected modules
        // This includes:
        // 1. Teacher-created questions (validated_by_teacher: true, no user_agreement field needed)
        // 2. Student-created questions that are validated by teacher AND agreed by student
        const questions = await Question.find({
            modul: { $in: moduleIdArray },
            validated_by_teacher: true
        })
            .populate('modul', 'name title')
            .populate('createdBy', 'name surname email')
            .sort({ createdAt: -1 });

        res.json({
            data: questions
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching validated questions',
            error: error.message
        });
    }
};

// Get count of validated questions by modules
const getValidatedQuestionsCount = async (req, res) => {
    try {
        const { moduleIds } = req.query;

        if (!moduleIds) {
            return res.json({
                count: 0
            });
        }

        // Split comma-separated module IDs
        const moduleIdArray = moduleIds.split(',').filter(id => id.trim());

        if (moduleIdArray.length === 0) {
            return res.json({
                count: 0
            });
        }

        // Count questions that are validated by teacher in the selected modules
        // This includes both teacher-created and student-created questions
        const count = await Question.countDocuments({
            modul: { $in: moduleIdArray },
            validated_by_teacher: true
        });

        res.json({
            count
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error counting validated questions',
            error: error.message,
            count: 0
        });
    }
};

module.exports = {
    getValidatedQuestionsByModules,
    getValidatedQuestionsCount,
};
