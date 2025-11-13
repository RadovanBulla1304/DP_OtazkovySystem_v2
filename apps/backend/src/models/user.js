const mongoose = require("mongoose")
const crypto = require("crypto")

const HASH_ITERATIONS = 1000
const HASH_KEYLEN = 64
const HASH_DIGEST = "sha512"

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    groupNumber: {
      type: String,
      required: true,
      trim: true,
    },
    studentNumber: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
    },
    password: { type: String },
    salt: { type: String },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emailConfirmed: { type: Boolean, default: false },
    emailConfirmationToken: { type: String },
    emailConfirmationExpires: { type: Date },
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    lastUnassignedDate: {
      type: Date,
      default: null,
    },
    points: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Point",
      },
    ],

    weeklyQuestionCount: [
      {
        week: { type: Date, required: true }, // Start of week
        count: { type: Number, default: 0 },
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
UserSchema.index({ email: 1 })
UserSchema.index({ studentNumber: 1 })
UserSchema.index({ groupNumber: 1 })
UserSchema.index({ assignedSubjects: 1 })
UserSchema.index({ "weeklyQuestionCount.week": 1, "weeklyQuestionCount.moduleId": 1 })

// Virtual full name
UserSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`.trim()
})

// Set password
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex")
  this.password = crypto.pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString("hex")
}

// Check password
UserSchema.methods.checkPassword = function (password) {
  if (!this.salt || !this.password) return false

  const hashedAttempt = crypto.pbkdf2Sync(password, this.salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST)

  const storedPassword = Buffer.from(this.password, "hex")
  return storedPassword.length === hashedAttempt.length && crypto.timingSafeEqual(storedPassword, hashedAttempt)
}

module.exports = mongoose.model("User", UserSchema)
