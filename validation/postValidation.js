const Joi = require("joi");

postSchema = Joi.object({
  content: Joi.string().min(1).max(496).required().messages({
    "string.max": "Content cannot exceed 496 characters.",
  }),
  images: Joi.array().min(0).max(3).messages({
    "array.min": "At least one image is required.",
    "array.max": "No more than 3 images are allowed."
  })
});

module.exports = postSchema;