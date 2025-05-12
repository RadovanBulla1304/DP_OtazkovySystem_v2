const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    personalNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{6}$/, // Reštrikcia na 6-miestne osobné číslo
    },
    password: { type: String },
    activationHash: { type: String },
    salt: { type: String },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    userType: {
      type: String,
      enum: ["student", "employee", "admin"],
      required: true,
    },
    name: { type: String },
    surname: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuálny atribút na zobrazenie celého mena
UserSchema.virtual("fullName").get(function () {
  return `${this.name || ""} ${this.surname || ""}`.trim();
});

// Nastavenie hesla
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
};

// Overenie hesla
UserSchema.methods.checkPassword = function (password) {
  const hash_pwd = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
  return this.password === hash_pwd;
};

// Funkcia na pridanie študenta
UserSchema.statics.addStudent = async function ({
  personalNumber,
  email,
  name,
  surname,
  password,
}) {
  // Validácia hesla (ISIC formát: jedno písmeno, 12 číslic, jedno písmeno)
  const isValidISIC = /^[A-Za-z][0-9]{12}[A-Za-z]$/.test(password);
  if (!isValidISIC) {
    throw new Error(
      "Invalid ISIC password format. Password must follow the format: Letter + 12 digits + Letter."
    );
  }

  const student = new this({
    personalNumber,
    email,
    name,
    surname,
    userType: "student",
  });

  student.setPassword(password);

  await student.save();
  return student;
};

// Funkcia na pridanie zamestnanca alebo admina
UserSchema.statics.addEmployeeOrAdmin = async function ({
  personalNumber,
  email,
  name,
  surname,
  password,
  userType, // Očakáva hodnotu "admin" alebo "employee"
}) {
  if (!["admin", "employee"].includes(userType)) {
    throw new Error(
      'Invalid userType. It must be either "admin" or "employee".'
    );
  }

  const isAdmin = userType === "admin";

  const user = new this({
    personalNumber,
    email,
    name,
    surname,
    userType,
    isAdmin,
  });

  user.setPassword(password);

  await user.save();
  return user;
};

module.exports = mongoose.model("User", UserSchema);
