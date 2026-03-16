const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const backupFileArg = process.argv[2];

if (!backupFileArg) {
    console.error("Usage: npm run db:restore -- volumes/backups/<backup-file>.archive.gz");
    process.exit(1);
}

const dbName = process.env.MONGO_DB_NAME || "otazkovySystem";
const mongoUser = process.env.MONGO_ROOT_USERNAME || "mongoUser";
const mongoPassword = process.env.MONGO_ROOT_PASSWORD || "hatatitla123*+465";
const uri = `mongodb://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPassword)}@localhost:27017/${dbName}?authSource=admin`;

const backupFile = path.resolve(process.cwd(), backupFileArg);

if (!fs.existsSync(backupFile)) {
    console.error(`Backup file not found: ${backupFile}`);
    process.exit(1);
}

const command = `cmd /c type \"${backupFile}\" | docker compose exec -T mongo mongorestore --uri=\"${uri}\" --drop --archive --gzip`;

try {
    execSync(command, { stdio: "inherit" });
    console.log(`Restore finished from: ${backupFile}`);
} catch (error) {
    console.error("DB restore failed.");
    process.exit(error.status || 1);
}
