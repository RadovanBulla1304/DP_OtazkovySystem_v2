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
      const loggedUser = await User.findOne({ _id: req.user.user_id });
      return res.status(200).send(loggedUser);
    }
  },
];

exports.getUserById = [
  async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        return res.status(404).send({ message: req.t("messages.user_not_found") });
      }
      res.status(200).send(user);
    } catch (err) {
      throwError(`${req.t("messages.database_error")}: ${err.message}`, 500);
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

