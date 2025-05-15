const Joi = require("joi");
const AppError = require("../utils/AppError");

const minAge = 13;
const minBirthDate = new Date();
minBirthDate.setFullYear(minBirthDate.getFullYear() - minAge);

exports.signupSchema = Joi.object({
    name: Joi.string().min(10).max(15).required(),
    email: Joi.string().email().required().lowercase(),
    password: Joi.string()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number.",
    }),
    dateOfBirth: Joi.date()
    .less(minBirthDate)
    .required()
    .messages({
      "date.less": `You must be at least ${minAge} years old.`,
    }),
})

exports.loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
    }),
    password: Joi.string()
      .min(8)
      .max(16)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.empty": "Password is required",
      }),
  });

exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) return next(new AppError(error.details[0].message, 400));
    next();
  };
};
