const { throwError } = require("../util/universal");
const QuestionAssignment = require("../models/questionAssignment");
const Question = require("../models/question");
const Point = require("../models/point");
const User = require("../models/user");

/**
 * Get or create question assignments for a user in Week 2
 * This ensures each user gets exactly 2 questions to validate, and assignments don't change
 */
exports.getOrCreateAssignments = async (req, res) => {
    try {
        const { userId, modulId } = req.params;
        const weekNumber = 2; // Week 2 is for validation

        // Check if user already has assignments for this module
        let assignments = await QuestionAssignment.find({
            assignedTo: userId,
            modul: modulId,
            weekNumber
        }).populate('question');

        // If assignments already exist, return them
        if (assignments && assignments.length > 0) {
            return res.status(200).json({
                success: true,
                data: assignments,
                message: 'Existing assignments retrieved'
            });
        }

        // No assignments yet - create new ones
        // Get all questions in this module that are NOT created by this user
        const availableQuestions = await Question.find({
            modul: modulId,
            createdBy: { $ne: userId }
        });

        if (availableQuestions.length === 0) {
            // No questions available - award automatic points
            const pointsToAward = 2;

            for (let i = 0; i < pointsToAward; i++) {
                const point = new Point({
                    student: userId,
                    reason: `Automatic point - no questions available for validation (${i + 1}/2)`,
                    points: 1,
                    category: 'question_validation'
                });
                await point.save();
                await User.findByIdAndUpdate(userId, { $push: { points: point._id } });
            }

            return res.status(200).json({
                success: true,
                data: [],
                message: 'No questions available - automatic points awarded',
                automaticPoints: pointsToAward
            });
        }

        // Get existing assignment counts for each question to distribute evenly
        const assignmentCounts = await QuestionAssignment.aggregate([
            { $match: { modul: modulId, weekNumber } },
            { $group: { _id: '$question', count: { $sum: 1 } } }
        ]);

        // Create a map of question ID to assignment count
        const countMap = {};
        assignmentCounts.forEach(item => {
            countMap[item._id.toString()] = item.count;
        });

        // Sort questions by assignment count (least assigned first) and shuffle within same count
        const questionsWithCounts = availableQuestions.map(q => ({
            question: q,
            count: countMap[q._id.toString()] || 0
        }));

        questionsWithCounts.sort((a, b) => {
            if (a.count !== b.count) return a.count - b.count;
            // Random shuffle within same count
            return Math.random() - 0.5;
        });

        // Take up to 2 questions
        const questionsToAssign = questionsWithCounts.slice(0, Math.min(2, questionsWithCounts.length));

        // Create assignments
        const newAssignments = [];
        for (const { question } of questionsToAssign) {
            const assignment = new QuestionAssignment({
                question: question._id,
                assignedTo: userId,
                modul: modulId,
                weekNumber
            });
            await assignment.save();
            newAssignments.push(assignment);
        }

        // If fewer than 2 questions available, award automatic points for the missing ones
        const missingQuestions = 2 - questionsToAssign.length;
        let automaticPoints = 0;

        if (missingQuestions > 0) {
            for (let i = 0; i < missingQuestions; i++) {
                const point = new Point({
                    student: userId,
                    reason: `Automatic point - only ${questionsToAssign.length} question(s) available (${i + 1}/${missingQuestions})`,
                    points: 1,
                    category: 'question_validation'
                });
                await point.save();
                await User.findByIdAndUpdate(userId, { $push: { points: point._id } });
                automaticPoints++;
            }
        }

        // Populate and return
        const populatedAssignments = await QuestionAssignment.find({
            _id: { $in: newAssignments.map(a => a._id) }
        }).populate('question');

        res.status(201).json({
            success: true,
            data: populatedAssignments,
            message: 'New assignments created',
            automaticPoints
        });

    } catch (err) {
        throwError(`Error getting/creating question assignments: ${err.message}`, 500);
    }
};

/**
 * Get statistics about question assignments for a module
 */
exports.getAssignmentStats = async (req, res) => {
    try {
        const { modulId } = req.params;
        const weekNumber = 2;

        const stats = await QuestionAssignment.aggregate([
            { $match: { modul: modulId, weekNumber } },
            {
                $group: {
                    _id: '$question',
                    count: { $sum: 1 },
                    validators: { $push: '$assignedTo' }
                }
            },
            {
                $lookup: {
                    from: 'questions',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'questionDetails'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (err) {
        throwError(`Error fetching assignment stats: ${err.message}`, 500);
    }
};
