require("dotenv").config();

const mongoose = require("mongoose");
const { backfillUserAcademicProfile } = require("../src/migrations/backfillUserAcademicProfile");

const run = async () => {
    if (!process.env.MONGO_DATABASE_URL) {
        console.error("MONGO_DATABASE_URL is missing. Migration aborted.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_DATABASE_URL);
        const result = await backfillUserAcademicProfile();

        console.log("User academic profile migration finished.");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

run();
