const fs = require("fs");
const path = require("path");

const backupsDir = path.resolve(__dirname, "..", "volumes", "backups");

if (!fs.existsSync(backupsDir)) {
    console.log(`No backups directory found at: ${backupsDir}`);
    process.exit(0);
}

const files = fs
    .readdirSync(backupsDir)
    .filter((name) => name.endsWith(".archive.gz"))
    .sort()
    .reverse();

if (files.length === 0) {
    console.log("No backup archives found.");
    process.exit(0);
}

console.log("Available backups:");
for (const file of files) {
    console.log(`- ${file}`);
}
