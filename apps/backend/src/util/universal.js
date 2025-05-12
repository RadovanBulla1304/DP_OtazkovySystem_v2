const i18next = require("i18next");

exports.throwError = (message, statusCode = 400, errors) => {
  if (errors) {
    if (!errors.isEmpty()) {
      const error = new Error(message);
      error.reason = errors.array().join(", ");
      error.statusCode = statusCode;
      throw error;
    }
  } else {
    const error = new Error(message);
    error.reason = "";
    error.statusCode = statusCode;
    throw error;
  }
};

exports.errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return i18next.t(msg);
};

exports.addZero = (i) => {
  if (+i < 10) {
    i = "0" + i;
  }
  return i;
};
