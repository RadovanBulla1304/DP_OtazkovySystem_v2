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

// Teacher sign-in schema (same as user, but can be extended later)
const signinTeacherSchema = Joi.object({
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
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/@stud\.uniza\.sk$/)
    .required()
    .messages({
      "string.pattern.base": "Email musí končiť @stud.uniza.sk",
      "string.email": "Neplatný email",
      "any.required": "Email je povinný"
    }),
  groupNumber: Joi.string().min(1).required().messages({
    "string.empty": "validation.empty_groupNumber",
  }),
  studentNumber: Joi.number().required().messages({
    "number.base": "validation.invalid_studentNumber",
    "any.required": "validation.empty_studentNumber",
  }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)
    .required()
    .messages({
      "string.pattern.base": "Heslo musí mať aspoň 6 znakov, jedno veľké písmeno a jedno číslo",
      "string.empty": "Heslo je povinné",
      "any.required": "Heslo je povinné"
    }),
  password_confirmation: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      "any.only": "Potvrdenie hesla sa nezhoduje s heslom",
      "string.empty": "Potvrdenie hesla je povinné",
      "any.required": "Potvrdenie hesla je povinné"
    }),
});

const signupTeacherSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.empty": "Meno je povinné",
    "string.min": "Meno musí mať aspoň 2 znaky",
    "any.required": "Meno je povinné"
  }),
  surname: Joi.string().min(2).required().messages({
    "string.empty": "Priezvisko je povinné",
    "string.min": "Priezvisko musí mať aspoň 2 znaky",
    "any.required": "Priezvisko je povinné"
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/@uniza\.sk$/)
    .required()
    .messages({
      "string.pattern.base": "Email musí končiť @uniza.sk",
      "string.email": "Neplatný email",
      "any.required": "Email je povinný"
    }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)
    .required()
    .messages({
      "string.pattern.base": "Heslo musí mať aspoň 6 znakov, jedno veľké písmeno a jedno číslo",
      "string.empty": "Heslo je povinné",
      "any.required": "Heslo je povinné"
    }),
  password_confirmation: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      "any.only": "Potvrdenie hesla sa nezhoduje s heslom",
      "string.empty": "Potvrdenie hesla je povinné",
      "any.required": "Potvrdenie hesla je povinné"
    }),
});


module.exports = {
  signinSchema,
  signupSchema,
  signupTeacherSchema,
  signinTeacherSchema,
};
