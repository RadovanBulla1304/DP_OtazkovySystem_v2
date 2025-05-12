const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { throwError } = require("../util/universal");
const { validate, validated } = require("../util/validation");
const { signinSchema } = require("../schemas/auth.schema");

exports.SignIn = [
  validate(signinSchema),
  async (req, res) => {
    const { email, password } = validated(req);
    const user = await User.findOne({ email });
    if (!user) {
      throwError(req.t("messages.invalid_credentials"), 400);
    }
    if (!user.checkPassword(password) || !user.isActive) {
      throwError(req.t("messages.invalid_credentials"), 400);
    }
    const token = jwt.sign(
      {
        user_id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.TOKEN_KEY
    );

    res.status(200).send({ token });
  },
];

exports.checkUiVersion = async (req, res) => {
  let appUiVersion = process.env.APP_VERSION;

  const respObj = {
    appUiVersion,
    forceReaload: false,
  };
  if (req.params.version) {
    if (req.params.version !== appUiVersion) {
      respObj.forceReaload = true;
    }
  }

  return res.status(200).send(respObj);
};
