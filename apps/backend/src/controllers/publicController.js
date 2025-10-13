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
    // Find teacher by email and isAdmin true
    const user = await Teacher.findOne({ email });
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
        is_admin: user.is_admin,
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
      console.error('Error sending confirmation email:', error);
      // Continue even if email fails - user can request a new token later
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

    // Hash the password using crypto
    const hashedPassword = crypto
      .createHmac("sha256", process.env.SALT_KEY)
      .update(password)
      .digest("hex");

    // Create and save the new teacher
    const teacher = new Teacher({
      name,
      surname,
      email,
      password: hashedPassword,
      isActive: true,
      isAdmin: false, // Default to false, admin can upgrade later
    });

    await teacher.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: teacher._id,
        isAdmin: teacher.isAdmin,
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

    console.log('📧 Confirmation request received for token:', token);

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).send({ message: 'Token je povinný' });
    }

    // First, try to find user with this token (active confirmation)
    let user = await User.findOne({
      emailConfirmationToken: token,
      emailConfirmationExpires: { $gt: new Date() }, // Token not expired
    });

    console.log('🔍 User search result:', user ? `Found: ${user.email}` : 'Not found');

    if (!user) {
      // Check if the email was already confirmed (token was cleared)
      // Try to find any user that had this token but already confirmed
      const confirmedUser = await User.findOne({
        emailConfirmed: true,
        $or: [
          { emailConfirmationToken: token },
          { emailConfirmationToken: { $exists: false } }
        ]
      });

      if (confirmedUser) {
        console.log('✅ Email already confirmed for user:', confirmedUser.email);
        return res.status(200).send({
          message: 'Tento email je už potvrdený. Môžete sa prihlásiť.',
          success: true,
          alreadyConfirmed: true
        });
      }

      console.log('❌ User not found or token expired');
      return res.status(400).send({
        message: 'Neplatný alebo expirovaný token. Prosím, registrujte sa znova.'
      });
    }

    // Update user
    user.emailConfirmed = true;
    user.isActive = true;
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpires = undefined;
    await user.save();

    console.log('✅ Email confirmed successfully for:', user.email);

    res.status(200).send({
      message: 'Email bol úspešne potvrdený. Môžete sa prihlásiť.',
      success: true
    });
  } catch (error) {
    console.error('❌ Error confirming email:', error);
    res.status(500).send({ message: 'Chyba pri potvrdení emailu' });
  }
};