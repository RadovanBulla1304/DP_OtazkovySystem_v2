const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Teacher = require("../models/teacher");
const { throwError } = require("../util/universal");
const { validate, validated } = require("../util/validation");
const { signinSchema, signupSchema, signupTeacherSchema, signinTeacherSchema } = require("../schemas/auth.schema");
const { sendConfirmationEmail } = require("../services/emailService");
const crypto = require("crypto");
// Teacher sign-in


exports.signinTeacher = [
  validate(signinTeacherSchema),
  async (req, res) => {
    const { email, password } = validated(req);
    // Find teacher by email
    const user = await Teacher.findOne({ email });
    if (!user) {
      throwError(req.t("messages.invalid_credentials"), 400);
    }

    // Check password using the model's checkPassword method
    if (!user.checkPassword(password) || !user.isActive) {
      throwError(req.t("messages.invalid_credentials"), 400);
    }

    // Check if email is confirmed
    if (!user.emailConfirmed) {
      throwError("Email nie je potvrdený. Skontrolujte svoju emailovú schránku a potvrďte registráciu.", 403);
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        is_admin: user.isAdmin,
      },
      process.env.TOKEN_KEY
    );

    res.status(200).send({ token });
  },
];

exports.Register = [
  validate(signupSchema),
  async (req, res) => {
    const { email, password, password_confirmation, name, surname, groupNumber, studentNumber } = validated(req);
    // Check if passwords match
    if (password !== password_confirmation) {
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

    // Generate email confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // Token valid for 24 hours

    // Create and save the new user
    const user = new User({
      name,
      surname,
      email,
      groupNumber,
      studentNumber,
      password: hashedPassword,
      isActive: false, // User must confirm email first
      emailConfirmed: false,
      emailConfirmationToken: confirmationToken,
      emailConfirmationExpires: tokenExpires,
    });

    await user.save();

    // Send confirmation email
    try {
      await sendConfirmationEmail(email, name, confirmationToken);
    } catch (error) {
    }

    res.status(201).send({
      message: 'Registrácia prebehla úspešne. Skontrolujte svoj email a potvrďte registráciu.',
      requiresEmailConfirmation: true
    });
  },
];

exports.RegisterTeacher = [
  validate(signupTeacherSchema),
  async (req, res) => {
    const { email, password, password_confirmation, name, surname } = validated(req);

    // Check if passwords match
    if (password !== password_confirmation) {
      throwError("Heslá sa nezhodujú", 400);
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      throwError("Email je už registrovaný", 400);
    }

    // Generate email confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // Token valid for 24 hours

    // Create the new teacher
    const teacher = new Teacher({
      name,
      surname,
      email,
      // DON'T set password here - use setPassword method instead
      isActive: false, // Teacher must confirm email first
      isAdmin: false, // Default to false, admin can upgrade later
      emailConfirmed: false,
      emailConfirmationToken: confirmationToken,
      emailConfirmationExpires: tokenExpires,
    });

    // Use the model's setPassword method to hash password correctly
    teacher.setPassword(password);

    await teacher.save();

    // Send confirmation email
    try {
      await sendConfirmationEmail(email, name, confirmationToken);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }

    res.status(201).send({
      message: 'Registrácia prebehla úspešne. Skontrolujte svoj email a potvrďte registráciu.',
      requiresEmailConfirmation: true
    });
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

    if (hashedPassword !== user.password) {
      throwError(req.t("messages.invalid_credentials"), 400);
    }

    // Check if email is confirmed
    if (!user.emailConfirmed) {
      throwError("Email nie je potvrdený. Skontrolujte svoju emailovú schránku a potvrďte registráciu.", 403);
    }

    if (!user.isActive) {
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

exports.ConfirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).send({ message: 'Token je povinný' });
    }

    // Try to find user with this token (active confirmation)
    let user = await User.findOne({
      emailConfirmationToken: token,
      emailConfirmationExpires: { $gt: new Date() }, // Token not expired
    });

    // If not found in users, try teachers
    let teacher = null;
    if (!user) {
      teacher = await Teacher.findOne({
        emailConfirmationToken: token,
        emailConfirmationExpires: { $gt: new Date() },
      });
    }

    if (!user && !teacher) {
      // Check if the email was already confirmed (token was cleared)
      const confirmedUser = await User.findOne({
        emailConfirmed: true,
        $or: [
          { emailConfirmationToken: token },
          { emailConfirmationToken: { $exists: false } }
        ]
      });

      const confirmedTeacher = await Teacher.findOne({
        emailConfirmed: true,
        $or: [
          { emailConfirmationToken: token },
          { emailConfirmationToken: { $exists: false } }
        ]
      });

      if (confirmedUser || confirmedTeacher) {
        return res.status(200).send({
          message: 'Tento email je už potvrdený. Môžete sa prihlásiť.',
          success: true,
          alreadyConfirmed: true
        });
      }

      return res.status(400).send({
        message: 'Neplatný alebo expirovaný token. Prosím, registrujte sa znova.'
      });
    }

    // Update user or teacher
    const account = user || teacher;
    account.emailConfirmed = true;
    account.isActive = true;
    account.emailConfirmationToken = undefined;
    account.emailConfirmationExpires = undefined;
    await account.save();

    res.status(200).send({
      message: 'Email bol úspešne potvrdený. Môžete sa prihlásiť.',
      success: true
    });
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(500).send({ message: 'Chyba pri potvrdení emailu' });
  }
};