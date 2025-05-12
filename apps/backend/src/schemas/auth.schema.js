const Joi = require("joi");

const signinSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({ "*": "validation.invalid_email" }),
  password: Joi.string()
    .required()
    .messages({ "*": "validation.empty_password" }),
});
const signupSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().required(),
  passwordConfirm: Joi.string().required(),
});

module.exports = {
  signinSchema,
  signupSchema,
};
