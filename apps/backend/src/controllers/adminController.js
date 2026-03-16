const { updateTeacherSchema } = require("../schemas/teacher.schema");
const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");
const crypto = require("crypto");

const Subject = require("../models/subject");
const User = require("../models/user");
const Teacher = require("../models/teacher");
const Project = require("../models/project");
const Point = require("../models/point");
const Module = require("../models/modul");
const TestAttempt = require("../models/testAttempt");
const Question = require("../models/question");
const ForumQuestion = require("../models/forumQuestion");
const Comment = require("../models/comment");
const mongoose = require("mongoose");

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
      const userName = `${record.name} ${record.surname}`.trim() || 'Deleted User';

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

      // Delete all test attempts associated with this user
      await TestAttempt.deleteMany({ user: userId });

      // Store user's name in their questions before deletion
      await Question.updateMany(
        { createdBy: userId },
        { $set: { createdByName: userName } }
      );

      // Store user's name in their forum questions before deletion
      await ForumQuestion.updateMany(
        { createdBy: userId, createdByModel: 'User' },
        { $set: { createdByName: userName } }
      );

      // Store user's name in their comments before deletion
      await Comment.updateMany(
        { createdBy: userId },
        { $set: { createdByName: userName } }
      );

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

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password -salt -__v")
      .populate("assignedSubjects", "name title")
      .populate({
        path: "assignedProjects",
        select: "name status due_date max_points subject",
        populate: { path: "subject", select: "name title" },
      });

    if (!user) {
      return res.status(404).json({ message: req.t("messages.user_not_found") });
    }

    const userObjectId = new mongoose.Types.ObjectId(id);

    const userProjects = await Project.find({ assigned_users: userObjectId })
      .select("name status due_date max_points subject")
      .populate("subject", "name title")
      .sort({ createdAt: -1 });

    const pointsAgg = await Point.aggregate([
      { $match: { student: userObjectId } },
      {
        $group: {
          _id: "$subject",
          totalPoints: { $sum: "$points" },
          itemsCount: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    const subjectIds = pointsAgg.map((row) => row._id).filter(Boolean);
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).select("name title");
    const subjectMap = subjects.reduce((acc, s) => {
      acc[String(s._id)] = s.name || s.title || "Bez názvu";
      return acc;
    }, {});

    const pointsBySubject = pointsAgg.map((row) => ({
      subjectId: row._id,
      subjectName: row._id ? subjectMap[String(row._id)] || "Bez názvu" : "Bez predmetu",
      totalPoints: row.totalPoints,
      itemsCount: row.itemsCount,
    }));

    const assignedSubjectIds = (user.assignedSubjects || []).map((s) => s._id);
    const modules = await Module.find({ subject: { $in: assignedSubjectIds } })
      .select("title week_number date_start date_end subject")
      .populate("subject", "name title")
      .sort({ date_start: 1 });

    const moduleIds = modules.map((m) => m._id);

    const createdQuestionsByModule = await Question.aggregate([
      { $match: { createdBy: userObjectId, modul: { $in: moduleIds } } },
      { $group: { _id: "$modul", count: { $sum: 1 } } },
    ]);

    const validatedByUserByModule = await Question.aggregate([
      { $match: { validated_by: userObjectId, modul: { $in: moduleIds } } },
      { $group: { _id: "$modul", count: { $sum: 1 } } },
    ]);

    const userResponsesByModule = await Question.aggregate([
      {
        $match: {
          createdBy: userObjectId,
          modul: { $in: moduleIds },
          "user_agreement.agreed": { $in: [true, false] },
        },
      },
      { $group: { _id: "$modul", count: { $sum: 1 } } },
    ]);

    const createdMap = createdQuestionsByModule.reduce((acc, row) => {
      acc[String(row._id)] = row.count;
      return acc;
    }, {});
    const validatedMap = validatedByUserByModule.reduce((acc, row) => {
      acc[String(row._id)] = row.count;
      return acc;
    }, {});
    const responsesMap = userResponsesByModule.reduce((acc, row) => {
      acc[String(row._id)] = row.count;
      return acc;
    }, {});

    const modulesOverview = modules.map((m) => ({
      _id: m._id,
      title: m.title,
      week_number: m.week_number,
      date_start: m.date_start,
      date_end: m.date_end,
      subjectName: m.subject?.name || m.subject?.title || "Bez názvu",
      createdQuestions: createdMap[String(m._id)] || 0,
      validatedQuestions: validatedMap[String(m._id)] || 0,
      responseCount: responsesMap[String(m._id)] || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        user,
        pointsBySubject,
        projects: userProjects,
        modulesOverview,
      },
    });
  } catch (error) {
    throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
  }
};

exports.updateUserAcademicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, isRepetent, isPostZapis } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: req.t("messages.user_not_found") });
    }

    if (adminNotes !== undefined) {
      user.adminNotes = String(adminNotes || "").trim();
    }
    if (isRepetent !== undefined) {
      user.isRepetent = Boolean(isRepetent);
    }
    if (isPostZapis !== undefined) {
      user.isPostZapis = Boolean(isPostZapis);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        adminNotes: user.adminNotes || "",
        isRepetent: !!user.isRepetent,
        isPostZapis: !!user.isPostZapis,
      },
    });
  } catch (error) {
    throwError(`${req.t("messages.database_error")}: ${error.message}`, 500);
  }
};




