const User = require("../models/user");

/**
 * Backfills newly introduced academic profile fields for existing users.
 * The update is idempotent and only writes fields that are currently missing.
 */
const backfillUserAcademicProfile = async () => {
    const [adminNotesResult, repetentResult, postZapisResult] = await Promise.all([
        User.updateMany(
            { adminNotes: { $exists: false } },
            { $set: { adminNotes: "" } },
        ),
        User.updateMany(
            { isRepetent: { $exists: false } },
            { $set: { isRepetent: false } },
        ),
        User.updateMany(
            { isPostZapis: { $exists: false } },
            { $set: { isPostZapis: false } },
        ),
    ]);

    return {
        adminNotesUpdated: adminNotesResult.modifiedCount,
        isRepetentUpdated: repetentResult.modifiedCount,
        isPostZapisUpdated: postZapisResult.modifiedCount,
        totalUpdated:
            adminNotesResult.modifiedCount +
            repetentResult.modifiedCount +
            postZapisResult.modifiedCount,
    };
};

module.exports = {
    backfillUserAcademicProfile,
};
