const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { throwError } = require("../util/universal");
const { validate, validated } = require("../util/validation");
const { signinSchema, signupSchema } = require("../schemas/auth.schema");
const crypto = require("crypto");

exports.Register = [
  validate(signupSchema),
  async (req, res) => {
    const { email, password, passwordConfirm, name } = validated(req);

    // Check if passwords match
    if (password !== passwordConfirm) {
      throwError(req.t("validation.passwords_do_not_match"), 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throwError(req.t("validation.email_already_registered"), 400);
    }

    // Hash the password using crypto
    const hashedPassword = crypto
      .createHmac("sha256", process.env.SALT_KEY)
      .update(password)
      .digest("hex");

    // Create and save the new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isActive: true, // or false if you want email verification flow
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.TOKEN_KEY
    );

    res.status(201).send({ token });
  },
];

exports.SignIn = [
  validate(signinSchema),
  async (req, res) => {
    const { email, password } = validated(req);
    const user = await User.findOne({ email });
    if (!user) {
      throwError(req.t("messages.invalid_credentials"), 400);
    }

    // Hash the provided password and compare with stored hash
    const hashedPassword = crypto
      .createHmac("sha256", process.env.SALT_KEY)
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password || !user.isActive) {
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
