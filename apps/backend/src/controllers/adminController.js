const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");

const Subject = require("../models/subject");
const User = require("../models/user");

const { validate, validated } = require("../util/validation");
const { createUserSchema, updateUserSchema } = require("../schemas/user.schema");
const { createSubject } = require("../schemas/subject.schema");

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

exports.createUser = [
  validate(createUserSchema),
  async (req, res) => {
    try {
      console.log('Request body:', req.body);
      // Make sure validated data exists before destructuring
      const validatedData = validated(req);
      if (!validatedData) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const { email, ...rest } = validatedData;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: req.t("validation.email_already_exist") });
      }

      if (rest.password !== rest.passwordConfirmation) {
        return res.status(400).json({ message: req.t("validation.passwords_not_match") });
      }

      const { passwordConfirmation, password, ...restData } = rest;

      // Convert string boolean values to actual booleans if needed
      const isAdmin = restData.isAdmin === 'true' || restData.isAdmin === true;
      const isActive = restData.isActive === 'true' || restData.isActive === true;

      const user = new User({
        email,
        isAdmin,
        isActive: isActive !== undefined ? isActive : true,
        ...restData
      });

      user.setPassword(password);
      await user.save();

      res.status(201).send({ email: user.email });
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({
        message: `${req.t("messages.database_error")}: ${err.message}`
      });
    }
  },
];

exports.edit = [
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
    console.log(data.userType);
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

exports.remove = async (req, res) => {
  const record = await User.findOne({ _id: req.params.id });
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

exports.createSubject = [
  validate(createSubject), // Validate the request body using the createSubject schema
  async (req, res) => {
    const matched = validated(req); // Extract validated data
    try {
      const subject = new Subject(matched); // Create a new Subject instance
      await subject.save(); // Save the subject to the database
      res.status(201).json(subject); // Respond with the created subject
    } catch (err) {
      throwError(`Error creating subject: ${err.message}`, 500); // Handle errors
    }
  },
];
exports.getAllSubjects = [
  async (req, res) => {
    try {
      const subjects = await Subject.find({}, { __v: 0 }); // Exclude the __v field
      res.status(200).json(subjects); // Respond with the list of subjects
    } catch (err) {
      throwError(`Error fetching subjects: ${err.message}`, 500); // Handle errors
    }
  },
];