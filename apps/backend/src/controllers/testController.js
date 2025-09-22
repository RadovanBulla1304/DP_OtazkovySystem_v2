const Test = require('../models/test');
const TestAttempt = require('../models/testAttempt');
const Module = require('../models/modul');
const Question = require('../models/question');

// Create a new test
createTest = async (req, res) => {
    try {
        const {
            title,
            description,
            total_questions,
            date_start,
            date_end,
            time_limit,
            subject,
            selected_modules,
            max_attempts,
            passing_score
        } = req.body;

        // Validate required fields
        if (!title || !total_questions || !date_start || !date_end || !subject || !selected_modules?.length) {
            return res.status(400).json({
                message: 'Missing required fields: title, total_questions, date_start, date_end, subject, selected_modules'
            });
        }

        // Validate dates
        const startDate = new Date(date_start);
        const endDate = new Date(date_end);
        if (startDate >= endDate) {
            return res.status(400).json({
                message: 'End date must be after start date'
            });
        }

        // Validate that selected modules exist and belong to the subject
        const modules = await Module.find({
            _id: { $in: selected_modules },
            subject: subject
        });

        if (modules.length !== selected_modules.length) {
            return res.status(400).json({
                message: 'Some selected modules do not exist or do not belong to the specified subject'
            });
        }

        // Check if there are enough questions in selected modules
        // Skip validation if skipValidationCheck flag is present
        if (!req.body.skipValidationCheck) {
            // First try to match with 'validated: true' (frontend field name)
            let questionCount = await Question.countDocuments({
                modul: { $in: selected_modules },
                validated: true
            });

            // If no validated questions, try with 'valid: true' (legacy field name)
            if (questionCount === 0) {
                questionCount = await Question.countDocuments({
                    modul: { $in: selected_modules },
                    valid: true
                });
            }

            console.log(`Found ${questionCount} valid/validated questions in selected modules`);

            if (questionCount < total_questions) {
                return res.status(400).json({
                    message: `Not enough valid questions in selected modules. Available: ${questionCount}, Required: ${total_questions}`
                });
            }
        } else {
            console.log('Skipping validation check as requested by client');
        }

        const test = new Test({
            title,
            description,
            total_questions,
            date_start: startDate,
            date_end: endDate,
            time_limit: time_limit || 30,
            subject,
            selected_modules,
            createdBy: req.teacherId || req.userId,
            max_attempts: max_attempts || 1,
            passing_score: passing_score || 60
        });

        const savedTest = await test.save();
        await savedTest.populate(['subject', 'selected_modules', 'createdBy']);

        res.status(201).json({
            message: 'Test created successfully',
            test: savedTest
        });
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({
            message: 'Error creating test',
            error: error.message
        });
    }
};

// Get all tests by subject
const getTestsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { page = 1, limit = 10, is_published } = req.query;

        const query = { subject: subjectId };
        if (is_published !== undefined) {
            query.is_published = is_published === 'true';
        }

        const tests = await Test.find(query)
            .populate('subject', 'name')
            .populate('selected_modules', 'name')
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Test.countDocuments(query);

        res.json({
            tests,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({
            message: 'Error fetching tests',
            error: error.message
        });
    }
};

// Get tests created by teacher
const getTestsByTeacher = async (req, res) => {
    try {
        const teacherId = req.teacherId;
        const { page = 1, limit = 10 } = req.query;

        const tests = await Test.find({ createdBy: teacherId })
            .populate('subject', 'name')
            .populate('selected_modules', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Test.countDocuments({ createdBy: teacherId });

        res.json({
            tests,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching teacher tests:', error);
        res.status(500).json({
            message: 'Error fetching tests',
            error: error.message
        });
    }
};

// Get test by ID
const getTestById = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await Test.findById(id)
            .populate('subject', 'name')
            .populate('selected_modules', 'name')
            .populate('createdBy', 'firstName lastName email');

        if (!test) {
            return res.status(404).json({
                message: 'Test not found'
            });
        }

        res.json(test);
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({
            message: 'Error fetching test',
            error: error.message
        });
    }
};

// Update test
const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Don't allow updating createdBy
        delete updateData.createdBy;

        // Validate dates if provided
        if (updateData.date_start && updateData.date_end) {
            const startDate = new Date(updateData.date_start);
            const endDate = new Date(updateData.date_end);
            if (startDate >= endDate) {
                return res.status(400).json({
                    message: 'End date must be after start date'
                });
            }
        }

        // Validate selected modules if provided
        if (updateData.selected_modules) {
            const modules = await Module.find({
                _id: { $in: updateData.selected_modules },
                subject: updateData.subject
            });

            if (modules.length !== updateData.selected_modules.length) {
                return res.status(400).json({
                    message: 'Some selected modules do not exist or do not belong to the specified subject'
                });
            }
        }

        const test = await Test.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate(['subject', 'selected_modules', 'createdBy']);

        if (!test) {
            return res.status(404).json({
                message: 'Test not found'
            });
        }

        res.json({
            message: 'Test updated successfully',
            test
        });
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).json({
            message: 'Error updating test',
            error: error.message
        });
    }
};

// Delete test
const deleteTest = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if test has any attempts
        const attemptCount = await TestAttempt.countDocuments({ test: id });
        if (attemptCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete test that has attempts. Please unpublish instead.'
            });
        }

        const test = await Test.findByIdAndDelete(id);

        if (!test) {
            return res.status(404).json({
                message: 'Test not found'
            });
        }

        res.json({
            message: 'Test deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({
            message: 'Error deleting test',
            error: error.message
        });
    }
};

// Publish/Unpublish test
const toggleTestPublication = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_published } = req.body;

        const test = await Test.findByIdAndUpdate(
            id,
            { is_published },
            { new: true }
        ).populate(['subject', 'selected_modules', 'createdBy']);

        if (!test) {
            return res.status(404).json({
                message: 'Test not found'
            });
        }

        res.json({
            message: `Test ${is_published ? 'published' : 'unpublished'} successfully`,
            test
        });
    } catch (error) {
        console.error('Error updating test publication status:', error);
        res.status(500).json({
            message: 'Error updating test publication status',
            error: error.message
        });
    }
};

// Get test statistics
const getTestStatistics = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await Test.findById(id);
        if (!test) {
            return res.status(404).json({
                message: 'Test not found'
            });
        }

        const attempts = await TestAttempt.find({ test: id, isCompleted: true });

        const statistics = {
            totalAttempts: attempts.length,
            averageScore: attempts.length > 0 ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length : 0,
            passRate: attempts.length > 0 ? (attempts.filter(attempt => attempt.passed).length / attempts.length) * 100 : 0,
            averageTime: attempts.length > 0 ? attempts.reduce((sum, attempt) => sum + attempt.totalTime_spent, 0) / attempts.length : 0
        };

        res.json(statistics);
    } catch (error) {
        console.error('Error fetching test statistics:', error);
        res.status(500).json({
            message: 'Error fetching test statistics',
            error: error.message
        });
    }
};

module.exports = {
    createTest,
    getTestsBySubject,
    getTestsByTeacher,
    getTestById,
    updateTest,
    deleteTest,
    toggleTestPublication,
    getTestStatistics
};