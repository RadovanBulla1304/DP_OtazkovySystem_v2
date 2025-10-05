const Test = require('../models/test');
const TestAttempt = require('../models/testAttempt');
const Module = require('../models/modul');
const Question = require('../models/question');
const TeacherValidatedQuestionForTest = require('../models/teacherValidatedQuestionForTest');

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
            createdBy: req.user.user_id,
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

        // Filter by publication status if specified
        if (is_published !== undefined) {
            query.is_published = is_published === 'true';
        }

        const tests = await Test.find(query)
            .populate('subject', 'name')
            .populate('selected_modules', 'title')
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
        const teacherId = req.user.user_id;
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
                success: false,
                message: 'Test not found'
            });
        }

        // Get all completed attempts with user and question details
        const attempts = await TestAttempt.find({ test: id, isCompleted: true })
            .populate('user', 'name email username')
            .populate('questions.question')
            .sort({ submittedAt: -1 });

        // Calculate basic statistics
        const totalAttempts = attempts.length;
        const averageScore = attempts.length > 0
            ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length
            : 0;
        const passedCount = attempts.filter(attempt => attempt.passed).length;
        const passRate = attempts.length > 0 ? (passedCount / attempts.length) * 100 : 0;
        const averageTime = attempts.length > 0
            ? attempts.reduce((sum, attempt) => sum + (attempt.totalTime_spent || 0), 0) / attempts.length
            : 0;

        // Get unique users who took the test
        const uniqueUsers = new Set(attempts.map(a => a.user?._id?.toString())).size;

        // Calculate question-level statistics (most frequently wrong)
        const questionStats = {};
        attempts.forEach(attempt => {
            attempt.questions.forEach(q => {
                const questionId = q.question?._id?.toString();
                if (!questionId) return;

                if (!questionStats[questionId]) {
                    questionStats[questionId] = {
                        question: q.question,
                        totalAttempts: 0,
                        wrongAttempts: 0,
                        wrongRate: 0
                    };
                }
                questionStats[questionId].totalAttempts++;
                if (!q.is_correct) {
                    questionStats[questionId].wrongAttempts++;
                }
            });
        });

        // Calculate wrong rates and sort
        const mostWrongQuestions = Object.values(questionStats)
            .map(stat => ({
                ...stat,
                wrongRate: (stat.wrongAttempts / stat.totalAttempts) * 100
            }))
            .sort((a, b) => b.wrongRate - a.wrongRate)
            .slice(0, 5); // Top 5 most frequently wrong questions

        // Prepare user attempts data
        const userAttempts = attempts.map(attempt => ({
            _id: attempt._id,
            user: {
                _id: attempt.user?._id,
                name: attempt.user?.name || attempt.user?.username || 'Unknown User',
                email: attempt.user?.email
            },
            score: attempt.score,
            passed: attempt.passed,
            submittedAt: attempt.submittedAt,
            totalTime_spent: attempt.totalTime_spent,
            correctAnswers: attempt.questions.filter(q => q.is_correct).length,
            totalQuestions: attempt.questions.length
        }));

        const statistics = {
            test: {
                _id: test._id,
                title: test.title,
                total_questions: test.total_questions,
                passing_score: test.passing_score
            },
            summary: {
                totalAttempts,
                uniqueUsers,
                averageScore: Math.round(averageScore * 100) / 100,
                passRate: Math.round(passRate * 100) / 100,
                passedCount,
                failedCount: totalAttempts - passedCount,
                averageTime: Math.round(averageTime)
            },
            mostWrongQuestions,
            userAttempts
        };

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.error('Error fetching test statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching test statistics',
            error: error.message
        });
    }
};

// Start a new test attempt with random question selection
const startTestAttempt = async (req, res) => {
    try {
        const { id: testId } = req.params;
        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get test
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        // Check if test is published
        if (!test.is_published) {
            return res.status(403).json({
                success: false,
                message: 'Test is not published yet'
            });
        }

        // Check if test is within date range
        const now = new Date();
        if (now < test.date_start || now > test.date_end) {
            return res.status(403).json({
                success: false,
                message: 'Test is not available at this time'
            });
        }

        // Check if user has exceeded max attempts
        const previousAttempts = await TestAttempt.countDocuments({
            test: testId,
            user: userId,
            isCompleted: true
        });

        if (previousAttempts >= test.max_attempts) {
            return res.status(403).json({
                success: false,
                message: `Maximum attempts (${test.max_attempts}) reached for this test`
            });
        }

        // Check if user has an ongoing attempt
        const ongoingAttempt = await TestAttempt.findOne({
            test: testId,
            user: userId,
            isCompleted: false
        });

        if (ongoingAttempt) {
            // Populate questions for ongoing attempt
            await ongoingAttempt.populate('questions.question');
            await ongoingAttempt.populate('test');

            return res.status(200).json({
                success: true,
                message: 'Ongoing attempt found',
                data: ongoingAttempt
            });
        }

        // Get all validated questions from test's pool
        const validatedQuestionsInPool = await TeacherValidatedQuestionForTest.find({
            test: testId,
            modul: { $in: test.selected_modules }
        }).populate('question');

        // Also get all other teacher-validated questions from selected modules (not just those explicitly added to test)
        const allValidatedQuestions = await Question.find({
            modul: { $in: test.selected_modules },
            validated: true
        });

        // Combine: prioritize questions explicitly added to test, then fill with other validated questions
        const poolQuestionIds = new Set(validatedQuestionsInPool.map(vq => vq.question._id.toString()));
        const additionalQuestions = allValidatedQuestions.filter(q => !poolQuestionIds.has(q._id.toString()));

        const allAvailableQuestions = [
            ...validatedQuestionsInPool.map(vq => vq.question),
            ...additionalQuestions
        ];

        if (allAvailableQuestions.length < test.total_questions) {
            return res.status(400).json({
                success: false,
                message: `Not enough questions available. Required: ${test.total_questions}, Available: ${allAvailableQuestions.length}`
            });
        }

        // Randomly select questions
        const shuffled = allAvailableQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, test.total_questions);

        // Create test attempt with selected questions
        const testAttempt = await TestAttempt.create({
            test: testId,
            user: userId,
            questions: selectedQuestions.map(q => ({
                question: q._id,
                selected_answer: null,
                is_correct: false,
                time_spent: 0
            })),
            startedAt: new Date(),
            isCompleted: false
        });

        // Populate the attempt for response
        await testAttempt.populate('questions.question');
        await testAttempt.populate('test');

        res.status(201).json({
            success: true,
            message: 'Test attempt started successfully',
            data: testAttempt
        });
    } catch (error) {
        console.error('Error starting test attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting test attempt',
            error: error.message
        });
    }
};

const submitTestAttempt = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body; // Array of { question: questionId, selected_answer: "a"|"b"|"c"|"d" }
        const userId = req.user.user_id;

        // Find the test attempt
        const testAttempt = await TestAttempt.findById(attemptId)
            .populate('questions.question')
            .populate('test');

        if (!testAttempt) {
            return res.status(404).json({
                success: false,
                message: 'Test attempt not found'
            });
        }

        // Verify the attempt belongs to the user
        // Convert both to strings for comparison
        const attemptUserId = testAttempt.user.toString();
        const requestUserId = userId.toString();

        console.log('Attempt user ID:', attemptUserId);
        console.log('Request user ID:', requestUserId);

        if (attemptUserId !== requestUserId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to submit this test attempt',
                debug: {
                    attemptUserId,
                    requestUserId
                }
            });
        }

        // Check if already completed
        if (testAttempt.isCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Test attempt already submitted'
            });
        }

        // Create a map of answers for quick lookup
        const answersMap = {};
        answers.forEach((ans) => {
            answersMap[ans.question] = ans.selected_answer;
        });

        // Calculate score and update answers
        let correctAnswers = 0;
        const totalQuestions = testAttempt.questions.length;

        testAttempt.questions.forEach((questionItem) => {
            const question = questionItem.question;
            const selectedAnswer = answersMap[question._id.toString()];

            questionItem.selected_answer = selectedAnswer || null;
            questionItem.is_correct = selectedAnswer === question.correct;

            if (questionItem.is_correct) {
                correctAnswers++;
            }
        });

        // Calculate score percentage
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = score >= testAttempt.test.passing_score;

        // Update test attempt
        testAttempt.score = score;
        testAttempt.passed = passed;
        testAttempt.isCompleted = true;
        testAttempt.submittedAt = new Date();

        await testAttempt.save();

        // Populate again to get fresh data
        await testAttempt.populate('questions.question');
        await testAttempt.populate('test');

        res.status(200).json({
            success: true,
            message: 'Test submitted successfully',
            data: {
                attemptId: testAttempt._id,
                score,
                passed,
                correctAnswers,
                totalQuestions,
                testAttempt
            }
        });
    } catch (error) {
        console.error('Error submitting test attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting test attempt',
            error: error.message
        });
    }
};

const getTestAttemptById = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const userId = req.user.user_id;

        const testAttempt = await TestAttempt.findById(attemptId)
            .populate('questions.question')
            .populate('test');

        if (!testAttempt) {
            return res.status(404).json({
                success: false,
                message: 'Test attempt not found'
            });
        }

        // Verify the attempt belongs to the user
        if (testAttempt.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this test attempt'
            });
        }

        res.status(200).json({
            success: true,
            data: testAttempt
        });
    } catch (error) {
        console.error('Error fetching test attempt:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching test attempt',
            error: error.message
        });
    }
};

const getUserTestAttempts = async (req, res) => {
    try {
        const { id: testId } = req.params; // Route uses :id not :testId
        const userId = req.user.user_id;

        console.log('getUserTestAttempts called:');
        console.log('  testId:', testId);
        console.log('  userId:', userId);
        console.log('  userId type:', typeof userId);

        const attempts = await TestAttempt.find({
            test: testId,
            user: userId,
            isCompleted: true
        })
            .select('score passed submittedAt')
            .sort({ submittedAt: -1 });

        console.log('  Found attempts:', attempts.length);
        if (attempts.length > 0) {
            console.log('  First attempt:', {
                test: attempts[0].test,
                user: attempts[0].user,
                score: attempts[0].score,
                passed: attempts[0].passed
            });
        }

        res.status(200).json({
            success: true,
            data: attempts
        });
    } catch (error) {
        console.error('Error fetching user test attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching test attempts',
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
    getTestStatistics,
    startTestAttempt,
    submitTestAttempt,
    getTestAttemptById,
    getUserTestAttempts
};