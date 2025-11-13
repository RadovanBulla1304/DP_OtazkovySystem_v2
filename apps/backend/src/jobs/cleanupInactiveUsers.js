const cron = require('node-cron');
const User = require('../models/user');
const Subject = require('../models/subject');
const Project = require('../models/project');
const Point = require('../models/point');
const TestAttempt = require('../models/testAttempt');
const Question = require('../models/question');
const ForumQuestion = require('../models/forumQuestion');
const Comment = require('../models/comment');

/**
 * Delete users who have been unassigned from all subjects for more than 3 years
 * This preserves their content (questions, forum questions, comments) with their name
 */
const deleteInactiveUsers = async () => {
    try {
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

        // Find users who:
        // 1. Have no assigned subjects (empty array)
        // 2. Were last unassigned more than 3 years ago
        const inactiveUsers = await User.find({
            assignedSubjects: { $size: 0 },
            lastUnassignedDate: { $lte: threeYearsAgo, $ne: null }
        });

        let deletedCount = 0;
        const deletedUserDetails = [];

        for (const user of inactiveUsers) {
            try {
                const userId = user._id;
                const userName = `${user.name} ${user.surname}`.trim() || 'Deleted User';

                // Remove user from all projects where they are assigned
                await Project.updateMany(
                    { assigned_users: userId },
                    { $pull: { assigned_users: userId } }
                );

                // Remove user from all subjects where they are assigned (should be none, but for safety)
                await Subject.updateMany(
                    { assigned_students: userId },
                    { $pull: { assigned_students: userId } }
                );

                // Delete all points associated with this user
                await Point.deleteMany({ student: userId });

                // Delete all test attempts associated with this user
                await TestAttempt.deleteMany({ user: userId });

                // Store user's name in their questions before deletion
                await Question.updateMany(
                    { createdBy: userId },
                    { $set: { createdByName: userName } }
                );

                // Store user's name in their forum questions before deletion
                await ForumQuestion.updateMany(
                    { createdBy: userId, createdByModel: 'User' },
                    { $set: { createdByName: userName } }
                );

                // Store user's name in their comments before deletion
                await Comment.updateMany(
                    { createdBy: userId },
                    { $set: { createdByName: userName } }
                );

                // Delete the user
                await user.deleteOne();

                deletedCount++;
                deletedUserDetails.push({
                    id: userId.toString(),
                    name: userName,
                    email: user.email,
                    lastUnassignedDate: user.lastUnassignedDate
                });

                console.log(`[Cleanup Inactive Users] Deleted user: ${userName} (${user.email})`);
            } catch (userError) {
                console.error(`[Cleanup Inactive Users] Error deleting user ${user.email}:`, userError);
            }
        }

        const result = {
            success: true,
            deletedCount,
            deletedUsers: deletedUserDetails,
            timestamp: new Date().toISOString()
        };

        console.log(`[Cleanup Inactive Users] Completed. Deleted ${deletedCount} inactive users.`);
        return result;
    } catch (error) {
        console.error('[Cleanup Inactive Users] Error during cleanup:', error);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Schedule the inactive user cleanup job
 * Runs on September 2nd at 02:00 (2 AM) - one day after yearly unassignment
 * This gives the unassignment job time to complete first
 * Cron format: minute hour day month day-of-week
 */
const scheduleInactiveUserCleanup = () => {
    // Schedule: September 2nd at 02:00 (2 AM)
    // '0 2 2 9 *' means: minute 0, hour 2, day 2, month 9 (September), any day of week
    const task = cron.schedule('0 2 2 9 *', async () => {
        console.log('[Cleanup Inactive Users] Starting scheduled cleanup job...');
        await deleteInactiveUsers();
    }, {
        scheduled: true,
        timezone: "Europe/Bratislava" // Adjust to your timezone
    });

    console.log('[Cleanup Inactive Users] Scheduled to run on September 2nd at 02:00');
    return task;
};

/**
 * Manual trigger for testing purposes
 * Can be called via an admin endpoint
 */
const triggerManualCleanup = async () => {
    console.log('[Cleanup Inactive Users] Manual trigger initiated...');
    return await deleteInactiveUsers();
};

module.exports = {
    scheduleInactiveUserCleanup,
    triggerManualCleanup,
    deleteInactiveUsers
};
