const { throwError } = require("../util/universal");
const QuestionAssignment = require("../models/questionAssignment");
const Question = require("../models/question");
const Point = require("../models/point");
const User = require("../models/user");
const Module = require("../models/modul");
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
        const moduleRecord = await Module.findById(modulId).select("subject");
        if (!moduleRecord) {
            return res.status(404).json({
                success: false,
                message: "Module not found",
            });
        }
        const moduleSubjectId = moduleRecord?.subject || null;
        // 1️⃣ Fetch all questions for the module
        const allQuestions = await Question.find({ modul: modulId });

        if (allQuestions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No questions to assign",
                assignments: [],
            });
        }

        // Get all students assigned to this subject (includes users who did not create questions)
        const assignedUsers = await User.find({
            assignedSubjects: moduleSubjectId,
            isActive: true,
        }).select("_id");

        // Keep creators in the pool as fallback if user-subject assignment data is incomplete
        const creatorIds = [...new Set(allQuestions.map((q) => String(q.createdBy)))];
        const assigneeIds = [
            ...new Set([
                ...assignedUsers.map((u) => String(u._id)),
                ...creatorIds,
            ])
        ];

        if (assigneeIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No users available for assignment",
                assignments: [],
            });
        }

        // Existing assignments are reused so reruns can fill missing users instead of exiting early
        const existingAssignments = await QuestionAssignment.find({
            modul: modulId,
            weekNumber,
        });

        const assignments = [];

        // Shuffle helper
        const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

        // Create a global pool of unassigned questions
        let globalPool = shuffle([...allQuestions]);
        const assignedGlobal = new Set(existingAssignments.map((a) => a.question.toString())); // track globally assigned question IDs

        // Index existing assignments by user to support incremental, idempotent reruns
        const assignmentsByUser = new Map();
        existingAssignments.forEach((a) => {
            const key = String(a.assignedTo);
            if (!assignmentsByUser.has(key)) assignmentsByUser.set(key, []);
            assignmentsByUser.get(key).push(a);
        });

        // Assign 2 questions to each user (not their own)
        for (const userId of assigneeIds) {
            const existingForUser = assignmentsByUser.get(userId) || [];
            let assignedCount = existingForUser.length;
            const userAssignments = [];

            const alreadyAssignedToUser = new Set(
                existingForUser.map((a) =>
                    a.question && a.question._id ? a.question._id.toString() : a.question.toString()
                )
            );

            if (assignedCount >= 2) {
                continue;
            }

            const needed = 2 - assignedCount;

            // Filter available, unassigned, not created by this user
            let available = globalPool.filter(
                (q) =>
                    String(q.createdBy) !== userId &&
                    !assignedGlobal.has(q._id.toString()) &&
                    !alreadyAssignedToUser.has(q._id.toString())
            );

            // If there are fewer than needed available, we will need reuse later
            const questionsToAssign = available.slice(0, needed);

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
                alreadyAssignedToUser.add(q._id.toString());
            }

            // Handle shortage → reuse if needed
            if (assignedCount < 2) {
                const remaining = 2 - assignedCount;

                // Reuse any (not their own)
                const reusable = shuffle(
                    allQuestions.filter(
                        (q) =>
                            String(q.createdBy) !== userId &&
                            !alreadyAssignedToUser.has(q._id.toString())
                    )
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
                    alreadyAssignedToUser.add(q._id.toString());
                }
            }

            // If still fewer than 2, award points instead
            if (assignedCount < 2) {
                const existingAutomaticPoints = await Point.countDocuments({
                    student: userId,
                    subject: moduleSubjectId,
                    category: "question_validation",
                    reason: { $regex: /Automatic point - insufficient questions available/ },
                });

                const credits = assignedCount + existingAutomaticPoints;
                const missing = Math.max(0, 2 - credits);

                for (let i = 0; i < missing; i++) {
                    const point = new Point({
                        student: userId,
                        subject: moduleSubjectId,
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
            message: assignments.length > 0 ? "Bulk assignments created successfully" : "Assignments already complete",
            assignments: assignments.length > 0 ? assignments : existingAssignments,
            summary: {
                totalAssignments: existingAssignments.length + assignments.length,
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

        const moduleRecord = await Module.findById(modulId).select("subject");
        const moduleSubjectId = moduleRecord?.subject || null;

        // Find all assignments for this user in this module
        const assignments = await QuestionAssignment.find({
            assignedTo: userId,
            modul: modulId,
            weekNumber
        }).populate('question'); // Populate the full question data

        // Check if any automatic points were awarded (when there weren't enough questions)
        const automaticPoints = await Point.find({
            student: userId,
            subject: moduleSubjectId,
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
