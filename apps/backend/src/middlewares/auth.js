const jwt = require("jsonwebtoken");
const { throwError } = require("../util/universal");

const verifyToken = async (req, res, next) => {
  if (req.url.startsWith("/public")) {
    return next();
  }

  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send();
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
    if (req.url.includes("/admin")) {
      if (!decoded.isAdmin) {
        return res.status(403).send();
      }
    }
    next();
  } catch (err) {
    throwError(req.t("messages.invalid_token"), 401);
  }
};

module.exports = verifyToken;
