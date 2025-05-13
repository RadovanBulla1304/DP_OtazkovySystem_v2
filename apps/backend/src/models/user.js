const mongoose = require("mongoose");
const crypto = require("crypto");

const HASH_ITERATIONS = 1000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = "sha512";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    salt: { type: String },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual full name (optional)
UserSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`.trim();
});

// Set password
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST)
    .toString("hex");
};

// Check password
UserSchema.methods.checkPassword = function (password) {
  if (!this.salt || !this.password) return false;

  const hashedAttempt = crypto
    .pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST);

  const storedPassword = Buffer.from(this.password, "hex");
  return (
    storedPassword.length === hashedAttempt.length &&
    crypto.timingSafeEqual(storedPassword, hashedAttempt)
  );
};

module.exports = mongoose.model("User", UserSchema);
