const { throwError } = require("../util/universal");
const Point = require("../models/point");
const Question = require("../models/question");
const User = require("../models/user"); // Assuming you have a User model

/**
 * Get all points for a user
 */
exports.getUserPoints = async (req, res) => {
    try {
        const userId = req.params.userId;
        const points = await Point.find({ student: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: points
        });
    } catch (err) {
        throwError(`Error fetching user points: ${err.message}`, 500);
    }
};

/**
 * Get summary of points by category for a user
 */
exports.getUserPointsSummary = async (req, res) => {
    try {
        const userId = req.params.userId;
        const points = await Point.find({ student: userId });

        // Group and sum points by category
        const summary = {};
        points.forEach(point => {
            if (!summary[point.category]) {
                summary[point.category] = 0;
            }
            summary[point.category] += point.points;
        });

        // Calculate total points
        const totalPoints = points.reduce((sum, point) => sum + point.points, 0);

        res.status(200).json({
            success: true,
            data: {
                summary,
                totalPoints
            }
        });
    } catch (err) {
        throwError(`Error fetching user points summary: ${err.message}`, 500);
    }
};

/**
 * Get points summary for multiple users
 */
exports.getUsersPointsSummary = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return throwError("Valid array of user IDs is required", 400);
        }

        // Find all points for the specified users
        const allPoints = await Point.find({ student: { $in: userIds } }).sort({ createdAt: -1 });

        // Group points by user
        const userSummaries = {};

        // Initialize summaries for all users
        for (const userId of userIds) {
            userSummaries[userId] = {
                totalPoints: 0,
                summary: {
                    question_creation: 0,
                    question_validation: 0,
                    question_reparation: 0,
                    test_performance: 0,
                    forum_participation: 0,
                    project_work: 0,
                    other: 0
                },
                details: []
            };
        }

        // Process all points
        allPoints.forEach(point => {
            const userId = point.student.toString();

            if (userSummaries[userId]) {
                // Add to total
                userSummaries[userId].totalPoints += point.points;

                // Add to category total
                if (userSummaries[userId].summary[point.category] !== undefined) {
                    userSummaries[userId].summary[point.category] += point.points;
                } else {
                    userSummaries[userId].summary[point.category] = point.points;
                }

                // Add to details array
                userSummaries[userId].details.push({
                    _id: point._id,
                    points: point.points,
                    reason: point.reason,
                    category: point.category,
                    createdAt: point.createdAt
                });
            }
        });

        // Get user info to add names to the response
        const users = await User.find({ _id: { $in: userIds } })
            .select('_id name surname email studentNumber');

        // Add user info to the response
        const result = users.map(user => {
            const userId = user._id.toString();
            return {
                user: {
                    _id: userId,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    studentNumber: user.studentNumber
                },
                points: userSummaries[userId]
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        throwError(`Error fetching users points summary: ${err.message}`, 500);
    }
};

/**
 * Award points for Week 1 - Question Creation
 * Awards 1 point per question created in Week 1
 */
exports.awardPointsForQuestionCreation = async (req, res) => {
    try {
        const week = 1;
        // Find questions created during Week 1 that haven't been awarded points yet
        const questions = await Question.find({
            "pointsAwarded.creation": { $ne: true }
        });

        if (!questions || questions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No new questions found for point assignment",
                awarded: 0
            });
        }

        // Group questions by student
        const questionsByStudent = {};
        questions.forEach(question => {
            const studentId = question.createdBy.toString();
            if (!questionsByStudent[studentId]) {
                questionsByStudent[studentId] = [];
            }
            questionsByStudent[studentId].push(question);
        });

        // Award points to each student
        let totalPointsAwarded = 0;
        const pointsAwarded = [];

        for (const [studentId, studentQuestions] of Object.entries(questionsByStudent)) {
            // Award 1 point per question
            for (const question of studentQuestions) {
                // Create point record
                const point = new Point({
                    student: studentId,
                    reason: `Vytvorenie otázky v týždni ${week}`,
                    points: 1, // 1 point per question
                    category: "question_creation",
                    related_entity: {
                        entity_type: "Question",
                        entity_id: question._id
                    }
                });

                await point.save();
                pointsAwarded.push(point);
                totalPointsAwarded += 1;

                // Add point to user's points array
                await User.findByIdAndUpdate(
                    studentId,
                    { $push: { points: point._id } }
                );

                // Mark question as having points awarded
                question.pointsAwarded = question.pointsAwarded || {};
                question.pointsAwarded.creation = true;
                await question.save();
            }
        }

        res.status(200).json({
            success: true,
            message: `Points awarded for ${totalPointsAwarded} questions created in Week ${week}`,
            data: pointsAwarded,
            awarded: totalPointsAwarded
        });

    } catch (err) {
        throwError(`Error awarding points for question creation: ${err.message}`, 500);
    }
};

/**
 * Award points for Week 2 - Question Validation
 * Awards 1 point per question validated in Week 2
 */
exports.awardPointsForQuestionValidation = async (req, res) => {
    try {
        const week = 2;

        // Find questions that have been validated but not awarded points yet
        const validatedQuestions = await Question.find({
            validated: { $exists: true },
            validated_by: { $exists: true },
            "pointsAwarded.validation": { $ne: true }
        });

        if (!validatedQuestions || validatedQuestions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No newly validated questions found for point assignment",
                awarded: 0
            });
        }

        // Group validations by validator
        const validationsByStudent = {};
        validatedQuestions.forEach(question => {
            // The validated_by field contains the ID of the user who validated the question
            const validatorId = question.validated_by.toString();
            if (!validationsByStudent[validatorId]) {
                validationsByStudent[validatorId] = [];
            }
            validationsByStudent[validatorId].push(question);
        });

        // Award points to each student who validated questions
        let totalPointsAwarded = 0;
        const pointsAwarded = [];

        for (const [validatorId, validatedQuestions] of Object.entries(validationsByStudent)) {
            // Award 1 point per validation
            for (const question of validatedQuestions) {
                // Create point record
                const point = new Point({
                    student: validatorId,
                    reason: `Validácia otázky v týždni ${week}`,
                    points: 1, // 1 point per validation
                    category: "question_validation",
                    related_entity: {
                        entity_type: "Question",
                        entity_id: question._id
                    }
                });

                await point.save();
                pointsAwarded.push(point);
                totalPointsAwarded += 1;

                // Add point to user's points array
                await User.findByIdAndUpdate(
                    validatorId,
                    { $push: { points: point._id } }
                );

                // Mark question as having validation points awarded
                question.pointsAwarded = question.pointsAwarded || {};
                question.pointsAwarded.validation = true;
                await question.save();
            }
        }

        res.status(200).json({
            success: true,
            message: `Points awarded for ${totalPointsAwarded} question validations in Week ${week}`,
            data: pointsAwarded,
            awarded: totalPointsAwarded
        });

    } catch (err) {
        throwError(`Error awarding points for question validation: ${err.message}`, 500);
    }
};

/**
 * Award points for Week 3 - Question Reparation (User Agreement)
 * Awards 1 point per question responded to in Week 3
 */
exports.awardPointsForQuestionReparation = async (req, res) => {
    try {
        const week = 3;

        // Find questions that have user agreement responses but haven't been awarded points
        const respondedQuestions = await Question.find({
            "user_agreement.agreed": { $exists: true },
            "user_agreement.responded_at": { $exists: true },
            "pointsAwarded.reparation": { $ne: true }
        });

        if (!respondedQuestions || respondedQuestions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No new question responses found for point assignment",
                awarded: 0
            });
        }

        // Award points for each response
        let totalPointsAwarded = 0;
        const pointsAwarded = [];

        for (const question of respondedQuestions) {
            // The question creator is the one who responded to validation
            const studentId = question.createdBy.toString();

            // Create point record
            const point = new Point({
                student: studentId,
                reason: `Reakcia na validáciu v týždni ${week}`,
                points: 1, // 1 point per response
                category: "question_reparation",
                related_entity: {
                    entity_type: "Question",
                    entity_id: question._id
                }
            });

            await point.save();
            pointsAwarded.push(point);
            totalPointsAwarded += 1;

            // Add point to user's points array
            await User.findByIdAndUpdate(
                studentId,
                { $push: { points: point._id } }
            );

            // Mark question as having reparation points awarded
            question.pointsAwarded = question.pointsAwarded || {};
            question.pointsAwarded.reparation = true;
            await question.save();
        }

        res.status(200).json({
            success: true,
            message: `Points awarded for ${totalPointsAwarded} question reparations in Week ${week}`,
            data: pointsAwarded,
            awarded: totalPointsAwarded
        });

    } catch (err) {
        throwError(`Error awarding points for question reparation: ${err.message}`, 500);
    }
};

/**
 * Award custom points to a user
 */
exports.awardCustomPoints = async (req, res) => {
    try {
        const { studentId, points, reason, category = "other" } = req.body;

        // Validate input
        if (!studentId || !points || !reason) {
            return throwError("Student ID, teacher ID, points amount, and reason are required", 400);
        }

        if (isNaN(points) || points <= 0) {
            return throwError("Points must be a positive number", 400);
        }

        // Find the student and teacher
        const student = await User.findById(studentId);
        if (!student) {
            return throwError("Student not found", 404);
        }



        // Create the point record
        const point = new Point({
            student: studentId,
            reason,
            points,
            category
        });

        await point.save();

        // Add point to user's points array
        await User.findByIdAndUpdate(
            studentId,
            { $push: { points: point._id } }
        );

        res.status(201).json({
            success: true,
            message: `${points} points awarded to student for ${reason}`,
            data: point
        });

    } catch (err) {
        throwError(`Error awarding custom points: ${err.message}`, 500);
    }
};

/**
 * Update existing point record
 */
exports.updatePoint = async (req, res) => {
    try {
        const { pointId } = req.params;
        const { points, reason } = req.body;

        // Validate input
        if (!pointId) {
            return throwError("Point ID is required", 400);
        }

        // Find the point record
        const point = await Point.findById(pointId);
        if (!point) {
            return throwError("Point record not found", 404);
        }

        // Update fields if provided
        if (points !== undefined) {
            if (isNaN(points)) {
                return throwError("Points must be a number", 400);
            }
            point.points = points;
        }

        if (reason !== undefined) {
            point.reason = reason;
        }

        await point.save();

        res.status(200).json({
            success: true,
            message: "Point record updated successfully",
            data: point
        });

    } catch (err) {
        throwError(`Error updating point: ${err.message}`, 500);
    }
};

/**
 * Delete a point record
 */
exports.deletePoint = async (req, res) => {
    try {
        const { pointId } = req.params;

        // Find and delete the point record
        const point = await Point.findById(pointId);
        if (!point) {
            return throwError("Point record not found", 404);
        }

        // Remove point from user's points array
        await User.findByIdAndUpdate(
            point.student,
            { $pull: { points: pointId } }
        );

        await Point.findByIdAndDelete(pointId);

        res.status(200).json({
            success: true,
            message: "Point record deleted successfully"
        });

    } catch (err) {
        throwError(`Error deleting point: ${err.message}`, 500);
    }
};