const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");

const User = require("../models/user");
const { validate, validated } = require("../util/validation");
const { editUserSchema } = require("../schemas/user.schema");

exports.SignOut = [
  async (req, res) => {
    if (req.user.user_id) {
      const loggedUser = await User.findOne({ _id: req.user.user_id });
      if (loggedUser) {
        await loggedUser.save();
        return res.status(200).send();
      } else {
        throwError(req.t("messages.singout_error"), 500);
      }
    } else {
      throwError(req.t("messages.singout_error"), 404);
    }
  },
];

exports.getCurrentUser = [
  async (req, res) => {
    if (req.user.user_id) {
      const loggedUser = await User.findOne(
        { _id: req.user.user_id },
        {
          email: 1,
          isAdmin: 1,
          name: 1,
          fullName: 1,
        }
      );
      return res.status(200).send(loggedUser);
    }
  },
];

exports.edit = [
  validate(editUserSchema),
  async (req, res) => {
    const matched = validated(req);
    const user = await User.findOne({ _id: req.user.user_id });
    if (user) {
      try {
        Object.assign(user, matched);
        await user.save();
        return res
          .status(200)
          .send({ message: req.t("messages.edit_data_succes") });
      } catch (error) {
        throwError(
          `${req.t("messages.database_error")}: ${error.message}`,
          500
        );
      }
    } else {
      return res.status(404).send();
    }
  },
];

exports.changePassword = [
  body("password").not().isEmpty().withMessage("validation.empty_password"),
  body("password_repeat")
    .not()
    .isEmpty()
    .withMessage("validation.empty_password"),
  body("password")
    .matches(/[0-9]/)
    .withMessage("validation.password_must_contain_number"),
  body("password")
    .matches(/[a-z]/)
    .withMessage("validation.password_must_contain_lowercase"),
  body("password")
    .matches(/[A-Z]/)
    .withMessage("validation.password_must_contain_uppercase"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("validation.password_must_contain_min_char"),

  async (req, res) => {
    throwError(
      req.t("messages.passwordChange"),
      400,
      validationResult(req).formatWith(errorFormatter)
    );
    const { password, password_repeat } = req.body;
    if (password !== password_repeat) {
      throwError(req.t("validation.passwords_not_match"), 400);
    }
    if (req.user.user_id) {
      try {
        const user = await User.findOne({ _id: req.user.user_id });
        if (user) {
          user.setPassword(password);
          await user.save();
          res
            .status(200)
            .send({ message: req.t("messages.password_change_success") });
        }
      } catch (err) {
        throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
      }
    }
  },
];
// Pridanie študenta
exports.addStudent = [
  body("personalNumber")
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid personal number"),
  body("password")
    .matches(/^[A-Za-z][0-9]{12}[A-Za-z]$/)
    .withMessage(
      "Password must follow the ISIC format: Letter + 12 digits + Letter."
    ),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { personalNumber, email, name, surname, password } = req.body;

    try {
      const student = await User.addStudent({
        personalNumber,
        email,
        name,
        surname,
        password,
      });
      res.status(201).json(student);
    } catch (err) {
      throwError(`Error adding student: ${err.message}`, 500);
    }
  },
];

// Pridanie zamestnanca/admina
exports.addEmployeeOrAdmin = [
  body("personalNumber")
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid personal number"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  async (req, res) => {
    console.log("Adding user...");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { personalNumber, email, name, surname, password, userType } =
      req.body;

    try {
      const user = await User.addEmployeeOrAdmin({
        personalNumber,
        email,
        name,
        surname,
        password,
        userType,
      });
      res.status(201).json(user);
    } catch (err) {
      throwError(`Error adding employee/admin: ${err.message}`, 500);
    }
  },
];
