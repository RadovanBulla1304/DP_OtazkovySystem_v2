const { updateTeacherSchema } = require("../schemas/teacher.schema");
const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");
const crypto = require("crypto");

const Subject = require("../models/subject");
const User = require("../models/user");
const Teacher = require("../models/teacher");
const Project = require("../models/project");
const Point = require("../models/point");

const { validate, validated } = require("../util/validation");
const { createUserSchema, updateUserSchema } = require("../schemas/user.schema");
const { createTeacherSchema } = require("../schemas/teacher.schema");

exports.createTeacher = [
  validate(createTeacherSchema),
  async (req, res) => {
    try {
      const validatedData = validated(req);
      if (!validatedData) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const {
        email,
        password,
        passwordConfirmation,
        name,
        surname,
        isAdmin,
        isActive
      } = validatedData;

      if (password !== passwordConfirmation) {
        return res.status(400).json({ message: req.t("validation.passwords_not_match") });
      }

      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher) {
        return res.status(400).json({ message: req.t("validation.email_already_exist") });
      }

      const hashedPassword = crypto
        .createHmac("sha256", process.env.SALT_KEY)
        .update(password)
        .digest("hex");

      const isAdminBool = isAdmin === "true" || isAdmin === true;
      const isActiveBool = isActive === "true" || isActive === true;

      const teacher = new Teacher({
        email,
        password: hashedPassword,
        name,
        surname,
        is_admin: isAdminBool,
        is_active: isActiveBool !== undefined ? isActiveBool : true
      });

      await teacher.save();

      res.status(201).send({ email: teacher.email });
    } catch (err) {
      res.status(500).json({
        message: `${req.t("messages.database_error")}: ${err.message}`,
      });
    }
  },
];
exports.editTeacher = [
  validate(updateTeacherSchema),
  async (req, res) => {
    const data = validated(req);
    const teacher = await Teacher.findOne({ _id: req.params.id });
    if (!teacher) {
      return res.status(404).send();
    }
    if (data.email) {
      const teacherByEmail = await Teacher.findOne({
        email: data.email,
        _id: { $ne: req.params.id },
      });
      if (teacherByEmail) {
        if (teacherByEmail._id.toString() !== teacher._id.toString()) {
          return res.status(400).json({ message: req.t("validation.email_already_exist") });
        }
      }
    }
    try {
      Object.assign(teacher, data);
      await teacher.save();
      return res.status(200).send({});
    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  },
];
const { createSubject, editSubject } = require("../schemas/subject.schema");

exports.getAllUser = [
  async (req, res) => {
    try {
      const users = await User.find(
        {
          email: {
            $nin: ["superAdmin@uniza.sk", "admin@admin.com"],
          },
        },
        { password: 0, salt: 0, __v: 0 }
      );
      res.status(200).send(users);
    } catch (err) {
      throwError(err.message, 500);
    }
  },
];
// Get all teachers
exports.getAllTeachers = [
  async (req, res) => {
    try {
      const teachers = await Teacher.find({}, { password: 0, salt: 0, __v: 0 });
      res.status(200).send(teachers);
    } catch (err) {
      throwError(err.message, 500);
    }
  },
];

exports.createUser = [
  validate(createUserSchema),
  async (req, res) => {
    try {
      // Make sure validated data exists before destructuring
      const validatedData = validated(req);
      if (!validatedData) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const {
        email,
        password,
        passwordConfirmation,
        name,
        surname,
        groupNumber,
        studentNumber,
        isAdmin,
        isActive
      } = validatedData;

      // Check if passwords match
      if (password !== passwordConfirmation) {
        return res.status(400).json({ message: req.t("validation.passwords_not_match") });
      }

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: req.t("validation.email_already_exist") });
      }

      // Hash the password using crypto
      const hashedPassword = crypto
        .createHmac("sha256", process.env.SALT_KEY)
        .update(password)
        .digest("hex");

      // Convert string boolean values to actual booleans if needed
      const isAdminBool = isAdmin === "true" || isAdmin === true;
      const isActiveBool = isActive === "true" || isActive === true;

      // Create and save the new user
      const user = new User({
        email,
        password: hashedPassword,
        name,
        surname,
        groupNumber,
        studentNumber,
        isAdmin: isAdminBool,
        isActive: isActiveBool !== undefined ? isActiveBool : true
      });

      await user.save();

      res.status(201).send({ email: user.email });
    } catch (err) {
      res.status(500).json({
        message: `${req.t("messages.database_error")}: ${err.message}`,
      });
    }
  },
];

exports.editUser = [
  validate(updateUserSchema),
  async (req, res) => {
    const data = validated(req);

    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).send();
    }
    if (data.email) {
      const userByEmail = await User.findOne({
        email: data.email,
        _id: { $ne: req.params.id },
      });
      if (userByEmail) {
        if (userByEmail._id.toString() !== user._id.toString()) {
          throwError(req.t("validation.email_already_exist"), 400);
        }
      }
    }
    if (data.userType === "admin") {
      // Ak je zmena užívateľa na admina
      data.isAdmin = true;
    }

    try {
      Object.assign(user, data);
      await user.save();
      return res.status(200).send({});
    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  },
];

exports.removeUser = async (req, res) => {
  const record = await User.findOne({ _id: req.params.id });
  if (record) {
    try {
      const userId = record._id;

      // Remove user from all projects where they are assigned
      await Project.updateMany(
        { assigned_users: userId },
        { $pull: { assigned_users: userId } }
      );

      // Remove user from all subjects where they are assigned
      await Subject.updateMany(
        { assigned_students: userId },
        { $pull: { assigned_students: userId } }
      );

      // Delete all points associated with this user
      await Point.deleteMany({ student: userId });

      // Also update the user's assignedSubjects and assignedProjects arrays to empty (optional cleanup)
      record.assignedSubjects = [];
      record.assignedProjects = [];
      await record.save();

      // Finally delete the user
      await record.deleteOne();

      res.status(200).send({});
    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  } else {
    throwError(req.t("messages.record_not_exists"), 404);
  }
};
// Remove a teacher by ID
exports.removeTeacher = async (req, res) => {
  const record = await Teacher.findOne({ _id: req.params.id });
  if (record) {
    try {
      await record.deleteOne();
      res.status(200).send({});
    } catch (error) {
      throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
    }
  } else {
    throwError(req.t("messages.record_not_exists"), 404);
  }
};




