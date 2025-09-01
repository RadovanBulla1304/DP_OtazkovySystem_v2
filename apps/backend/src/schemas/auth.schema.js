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
  name: Joi.string().min(2).required().messages({
    "string.empty": "validation.empty_name",
  }),
  surname: Joi.string().min(2).required().messages({
    "string.empty": "validation.empty_surname",
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  groupNumber: Joi.string().min(1).required().messages({
    "string.empty": "validation.empty_groupNumber",
  }),
  studentNumber: Joi.number().required().messages({
    "number.base": "validation.invalid_studentNumber",
    "any.required": "validation.empty_studentNumber",
  }),
  password: Joi.string().required(),
  password_confirmation: Joi.string().required(),
});


module.exports = {
  signinSchema,
  signupSchema,
};
