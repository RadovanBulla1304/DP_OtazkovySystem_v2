const cron = require('node-cron');
const Subject = require('../models/subject');
const User = require('../models/user');

/**
 * Unassign all students from all subjects
 * This runs automatically every year on September 1st at 00:00
 */
const unassignAllStudentsFromSubjects = async () => {
    try {
        console.log('[Yearly Unassignment] Starting yearly student unassignment process...');

        // Get all subjects that have assigned students
        const subjectsWithStudents = await Subject.find({
            assigned_students: { $exists: true, $ne: [] }
        });

        console.log(`[Yearly Unassignment] Found ${subjectsWithStudents.length} subjects with assigned students`);

        let totalUsersUpdated = 0;

        // For each subject with students, remove it from those students' assignedSubjects
        for (const subject of subjectsWithStudents) {
            if (subject.assigned_students && subject.assigned_students.length > 0) {
                // Remove this subject from all assigned students' assignedSubjects array
                const userResult = await User.updateMany(
                    { _id: { $in: subject.assigned_students } },
                    { $pull: { assignedSubjects: subject._id } }
                );

                totalUsersUpdated += userResult.modifiedCount;
            }
        }

        // Now clear assigned_students from all subjects
        const subjectResult = await Subject.updateMany(
            {},
            { $set: { assigned_students: [] } }
        );

        console.log(`[Yearly Unassignment] Successfully cleared assigned_students from ${subjectResult.modifiedCount} subjects`);
        console.log(`[Yearly Unassignment] Successfully removed subject references from ${totalUsersUpdated} users`);

        return {
            success: true,
            subjectsModified: subjectResult.modifiedCount,
            usersModified: totalUsersUpdated,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('[Yearly Unassignment] Error during yearly unassignment:', error);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Schedule the yearly unassignment job
 * Runs on September 1st at 00:00 (midnight)
 * Cron format: second minute hour day month day-of-week
 */
const scheduleYearlyUnassignment = () => {
    // Schedule: September 1st at 00:00 (midnight)
    // '0 0 1 9 *' means: minute 0, hour 0, day 1, month 9 (September), any day of week
    const task = cron.schedule('0 0 1 9 *', async () => {
        console.log('[Yearly Unassignment] Triggered scheduled yearly unassignment');
        await unassignAllStudentsFromSubjects();
    }, {
        scheduled: true,
        timezone: "Europe/Bratislava" // Adjust to your timezone
    });

    console.log('[Yearly Unassignment] Scheduled job registered - will run on September 1st at 00:00');

    return task;
};

/**
 * Manual trigger for testing purposes
 * Can be called via an admin endpoint
 */
const triggerManualUnassignment = async () => {
    console.log('[Yearly Unassignment] Manual trigger initiated');
    return await unassignAllStudentsFromSubjects();
};

module.exports = {
    scheduleYearlyUnassignment,
    triggerManualUnassignment,
    unassignAllStudentsFromSubjects
};
