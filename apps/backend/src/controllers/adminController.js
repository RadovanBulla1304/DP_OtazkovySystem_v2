const { body, validationResult, matchedData } = require("express-validator");
const { throwError, errorFormatter } = require("../util/universal");

const User = require("../models/user");
const { validate, validated } = require("../util/validation");
const { createUserShema, updateUserSchema } = require("../schemas/user.schema");

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
  validate(createUserShema),
  async (req, res) => {
    const { email, ...rest } = validated(req);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throwError(req.t("validation.email_already_exist"), 400);
    }

    if (rest.password !== rest.passwordConfirmation) {
      throwError(req.t("validation.passwords_not_match"), 400);
    }

    const user = new User({ email, isActive: true, ...rest });
    user.setPassword(rest.password);

    try {
      await user.save();
    } catch (err) {
      throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
    }

    res.status(201).send({ email: user.email });
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
