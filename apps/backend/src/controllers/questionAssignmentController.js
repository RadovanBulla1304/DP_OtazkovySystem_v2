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

        console.log("=== Bulk Assignment for Module ===");
        console.log("Module ID:", modulId);

        // 1️⃣ Fetch all questions for the module
        const allQuestions = await Question.find({ modul: modulId });
        console.log("Total questions in module:", allQuestions.length);

        if (allQuestions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No questions to assign",
                assignments: [],
            });
        }

        // 2️⃣ Get unique creators
        const creatorIds = [...new Set(allQuestions.map((q) => String(q.createdBy)))];
        console.log("Unique creators:", creatorIds.length);

        // 3️⃣ Prevent duplicate bulk assignment
        const existingAssignments = await QuestionAssignment.find({
            modul: modulId,
            weekNumber,
        });

        if (existingAssignments.length > 0) {
            console.log("Assignments already exist:", existingAssignments.length);
            return res.status(200).json({
                success: true,
                message: "Assignments already exist",
                assignments: existingAssignments,
            });
        }

        const assignments = [];

        // 4️⃣ Shuffle helper
        const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

        // 5️⃣ Create a global pool of unassigned questions
        let globalPool = shuffle([...allQuestions]);
        const assignedGlobal = new Set(); // track globally assigned question IDs

        console.log("Initial global pool:", globalPool.map((q) => q.text));

        // 6️⃣ Assign 2 questions to each user (not their own)
        for (const userId of creatorIds) {
            console.log(`\n--- Assigning for user: ${userId} ---`);
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
                console.log(`  ✓ Assigned: ${q.text}`);
            }

            // 7️⃣ Handle shortage → reuse if needed
            if (assignedCount < 2) {
                const remaining = 2 - assignedCount;
                console.log(`  ⚠ Only ${assignedCount} unique questions available, reusing ${remaining}...`);

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
                    console.log(`  ✓ Assigned (reused): ${q.text}`);
                }
            }

            // 8️⃣ If still fewer than 2, award points instead
            if (assignedCount < 2) {
                const missing = 2 - assignedCount;
                console.log(`  ⚠ Could only assign ${assignedCount}, awarding ${missing} automatic point(s)`);

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

            console.log(`User ${userId} assigned: ${userAssignments.join(", ")}`);
        }

        // 9️⃣ Summary
        console.log("=== Assignment Summary ===");
        console.log("Total assignments created:", assignments.length);

        const questionCounts = {};
        assignments.forEach((a) => {
            const qId = a.question.toString();
            questionCounts[qId] = (questionCounts[qId] || 0) + 1;
        });
        console.log("Questions assignment counts:", questionCounts);

        // 🔟 Respond with result
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
        console.error("Bulk assignment error:", err);
        throwError(`Error creating bulk assignments: ${err.message}`, 500);
    }
};



/**
 * Get or create question assignments for a user in Week 2
 * This ensures each user gets exactly 2 questions to validate, and assignments don't change
 */
// TOTO ASI ZAKMENTOVAT/odstranit
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
            console.log('Found existing assignments:', assignments.length);
            return res.status(200).json({
                success: true,
                data: assignments,
                message: 'Existing assignments retrieved'
            });
        }

        // No assignments yet - create new ones
        // Get all questions in this module
        const allQuestions = await Question.find({ modul: modulId });


        // Separate user's own questions from others' questions
        const ownQuestions = allQuestions.filter(q => String(q.createdBy) === String(userId));
        const othersQuestions = allQuestions.filter(q => String(q.createdBy) !== String(userId));



        if (othersQuestions.length === 0) {
            // No questions from other users - award automatic points
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
            { $match: { modul: mongoose.Types.ObjectId(modulId), weekNumber } },
            { $group: { _id: '$question', count: { $sum: 1 } } }
        ]);


        // Create a map of question ID to assignment count
        const countMap = {};
        assignmentCounts.forEach(item => {
            countMap[item._id.toString()] = item.count;
        });

        // Sort questions by assignment count (least assigned first) to ensure ALL questions get validated
        // Priority: questions with 0 assignments > questions with 1 assignment > etc.
        const questionsWithCounts = othersQuestions.map(q => ({
            question: q,
            count: countMap[q._id.toString()] || 0
        }));

        questionsWithCounts.sort((a, b) => {
            if (a.count !== b.count) return a.count - b.count;
            // Random shuffle within same count
            return Math.random() - 0.5;
        });


        // Take exactly 2 questions (or all available if less than 2)
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

        // Populate and return
        const populatedAssignments = await QuestionAssignment.find({
            _id: { $in: newAssignments.map(a => a._id) }
        }).populate('question');

        res.status(201).json({
            success: true,
            data: populatedAssignments,
            message: 'New assignments created',
            automaticPoints: 0
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
