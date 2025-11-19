const { throwError } = require("../util/universal");
const QuestionAssignment = require("../models/questionAssignment");
const Question = require("../models/question");
const Point = require("../models/point");
const User = require("../models/user");
const mongoose = require("mongoose");

/**
 * Bulk assign all questions to all users in a module
 * Ensures every question is validated, distributed evenly,
 * and prevents reuse unless absolutely necessary.
 */
exports.bulkAssignQuestionsForModule = async (req, res) => {
    try {
        const { modulId } = req.params;
        const weekNumber = 2;
        // 1️⃣ Fetch all questions for the module
        const allQuestions = await Question.find({ modul: modulId });

        if (allQuestions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No questions to assign",
                assignments: [],
            });
        }

        // Get unique creators
        const creatorIds = [...new Set(allQuestions.map((q) => String(q.createdBy)))];

        // Prevent duplicate bulk assignment
        const existingAssignments = await QuestionAssignment.find({
            modul: modulId,
            weekNumber,
        });

        if (existingAssignments.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Assignments already exist",
                assignments: existingAssignments,
            });
        }

        const assignments = [];

        // Shuffle helper
        const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

        // Create a global pool of unassigned questions
        let globalPool = shuffle([...allQuestions]);
        const assignedGlobal = new Set(); // track globally assigned question IDs

        // Assign 2 questions to each user (not their own)
        for (const userId of creatorIds) {
            let assignedCount = 0;
            const userAssignments = [];

            // Filter available, unassigned, not created by this user
            let available = globalPool.filter(
                (q) => String(q.createdBy) !== userId && !assignedGlobal.has(q._id.toString())
            );

            // If there are fewer than 2 available, we will need reuse later
            const questionsToAssign = available.slice(0, 2);

            // Assign unique questions first
            for (const q of questionsToAssign) {
                const assignment = new QuestionAssignment({
                    question: q._id,
                    assignedTo: userId,
                    modul: modulId,
                    weekNumber,
                });
                await assignment.save();
                assignments.push(assignment);
                userAssignments.push(q.text);
                assignedCount++;
                assignedGlobal.add(q._id.toString());
            }

            // Handle shortage → reuse if needed
            if (assignedCount < 2) {
                const remaining = 2 - assignedCount;

                // Reuse any (not their own)
                const reusable = shuffle(
                    allQuestions.filter((q) => String(q.createdBy) !== userId)
                ).slice(0, remaining);

                for (const q of reusable) {
                    const assignment = new QuestionAssignment({
                        question: q._id,
                        assignedTo: userId,
                        modul: modulId,
                        weekNumber,
                    });
                    await assignment.save();
                    assignments.push(assignment);
                    userAssignments.push(q.text + " (reused)");
                    assignedCount++;
                }
            }

            // If still fewer than 2, award points instead
            if (assignedCount < 2) {
                const missing = 2 - assignedCount;

                for (let i = 0; i < missing; i++) {
                    const point = new Point({
                        student: userId,
                        reason: `Automatic point - insufficient questions available (${i + 1}/${missing})`,
                        points: 1,
                        category: "question_validation",
                    });
                    await point.save();
                    await User.findByIdAndUpdate(userId, { $push: { points: point._id } });
                }
            }
        }

        // Summary
        const questionCounts = {};
        assignments.forEach((a) => {
            const qId = a.question.toString();
            questionCounts[qId] = (questionCounts[qId] || 0) + 1;
        });
        // Respond with result
        res.status(201).json({
            success: true,
            message: "Bulk assignments created successfully",
            assignments,
            summary: {
                totalAssignments: assignments.length,
                questionCounts,
            },
        });
    } catch (err) {
        throwError(`Error creating bulk assignments: ${err.message}`, 500);
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

exports.getQuestionAssignmentsByUser = async (req, res) => {
    try {
        const { userId, modulId } = req.params;
        const weekNumber = 2;

        // Find all assignments for this user in this module
        const assignments = await QuestionAssignment.find({
            assignedTo: userId,
            modul: modulId,
            weekNumber
        }).populate('question'); // Populate the full question data

        // Check if any automatic points were awarded (when there weren't enough questions)
        const automaticPoints = await Point.find({
            student: userId,
            category: 'question_validation',
            reason: { $regex: /Automatic point/ }
        });

        res.status(200).json({
            success: true,
            data: assignments,
            automaticPoints: automaticPoints.length
        });

    } catch (err) {
        throwError(`Error fetching question assignments: ${err.message}`, 500);
    }
};
