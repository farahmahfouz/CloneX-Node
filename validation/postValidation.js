const Joi = require("joi");

postSchema = Joi.object({
  content: Joi.string().min(1).max(496).required().messages({
    "string.max": "Content cannot exceed 496 characters.",
  }),
});

module.exports = postSchema;