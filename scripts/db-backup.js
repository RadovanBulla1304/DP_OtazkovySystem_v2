const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const formatTimestamp = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const dbName = process.env.MONGO_DB_NAME || "otazkovySystem";
const mongoUser = process.env.MONGO_ROOT_USERNAME || "mongoUser";
const mongoPassword = process.env.MONGO_ROOT_PASSWORD || "hatatitla123*+465";

const timestamp = formatTimestamp(new Date());
const backupsDir = path.resolve(__dirname, "..", "volumes", "backups");
const backupFile = path.join(backupsDir, `${dbName}_${timestamp}.archive.gz`);
const uri = `mongodb://${encodeURIComponent(mongoUser)}:${encodeURIComponent(mongoPassword)}@localhost:27017/${dbName}?authSource=admin`;

if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

const command = `docker compose exec -T mongo mongodump --uri=\"${uri}\" --archive --gzip > \"${backupFile}\"`;

try {
    execSync(command, { stdio: "inherit" });
    console.log(`Backup created: ${backupFile}`);
} catch (error) {
    console.error("DB backup failed.");
    process.exit(error.status || 1);
}
