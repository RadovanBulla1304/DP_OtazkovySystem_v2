const mongoose = require("mongoose");
const crypto = require("crypto");

const HASH_ITERATIONS = 1000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = "sha512";

const TeacherSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true }, // "meno.priezvko@uniza.sk"
        password: { type: String },
        salt: { type: String },
        name: { type: String, required: true }, // Meno
        surname: { type: String, required: true }, // Priezvisko
        isAdmin: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: [] }]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual full name
TeacherSchema.virtual("fullName").get(function () {
    return `${this.name} ${this.surname}`.trim();
});

// Set password
TeacherSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.password = crypto
        .pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST)
        .toString("hex");
};

// Check password
TeacherSchema.methods.checkPassword = function (password) {
    if (!this.salt || !this.password) return false;

    const hashedAttempt = crypto
        .pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST);

    const storedPassword = Buffer.from(this.password, "hex");
    return (
        storedPassword.length === hashedAttempt.length &&
        crypto.timingSafeEqual(storedPassword, hashedAttempt)
    );
};

module.exports = mongoose.model("Teacher", TeacherSchema);
