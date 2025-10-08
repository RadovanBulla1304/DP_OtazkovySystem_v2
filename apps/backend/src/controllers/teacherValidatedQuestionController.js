const Question = require('../models/question');

// Get validated questions for a specific test (legacy, might not be needed)
const getValidatedQuestionsForTest = async (req, res) => {
    try {
        const { testId } = req.params;
        res.json({
            data: []
        });
    } catch (error) {
        console.error('Error fetching validated questions for test:', error);
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
        console.error('Error fetching validated questions by modules:', error);
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
        const count = await Question.countDocuments({
            modul: { $in: moduleIdArray },
            validated_by_teacher: true
        });

        res.json({
            count
        });
    } catch (error) {
        console.error('Error counting validated questions:', error);
        res.status(500).json({
            message: 'Error counting validated questions',
            error: error.message,
            count: 0
        });
    }
};

// Add question to test pool (might not be needed with new approach)
const addQuestionToTestPool = async (req, res) => {
    try {
        // This functionality might not be needed anymore
        // Questions are automatically in the pool if validated_by_teacher = true
        res.status(200).json({
            message: 'Question is automatically in pool when validated by teacher'
        });
    } catch (error) {
        console.error('Error adding question to pool:', error);
        res.status(500).json({
            message: 'Error adding question to pool',
            error: error.message
        });
    }
};

// Remove question from test pool
const removeQuestionFromTestPool = async (req, res) => {
    try {
        const { id } = req.params;

        // To remove from pool, set validated_by_teacher to false
        const question = await Question.findByIdAndUpdate(
            id,
            { validated_by_teacher: false },
            { new: true }
        );

        if (!question) {
            return res.status(404).json({
                message: 'Question not found'
            });
        }

        res.json({
            message: 'Question removed from pool',
            data: question
        });
    } catch (error) {
        console.error('Error removing question from pool:', error);
        res.status(500).json({
            message: 'Error removing question from pool',
            error: error.message
        });
    }
};

module.exports = {
    // getValidatedQuestionsForTest,
    getValidatedQuestionsByModules,
    getValidatedQuestionsCount,
    // addQuestionToTestPool,
    // removeQuestionFromTestPool
};
