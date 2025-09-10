const jwt = require("jsonwebtoken");
const { throwError } = require("../util/universal");
const User = require("../models/user");
const Teacher = require("../models/teacher");

const verifyToken = async (req, res, next) => {
  if (req.url.startsWith("/public")) {
    return next();
  }

  // Accept token from x-access-token or Authorization header
  let token =
    req.headers["x-access-token"] ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(403).send();
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    // Try to find user in User collection
    let user = await User.findById(decoded.user_id);
    if (!user) {
      // Try to find user in Teacher collection
      user = await Teacher.findById(decoded.user_id);
    }
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    req.user = { user_id: user._id };
    if (req.url.includes("/admin")) {
      // Only allow admin access for users or teachers with isAdmin/is_admin true
      if (!(user.isAdmin || user.is_admin)) {
        return res.status(403).send();
      }
    }
    next();
  } catch (err) {
    throwError(req.t("messages.invalid_token"), 401);
  }
};

module.exports = verifyToken;
