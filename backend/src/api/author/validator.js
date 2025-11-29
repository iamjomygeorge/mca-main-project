const { body } = require("express-validator");

const bookUploadRules = () => {
  return [
    body("title").trim().notEmpty().withMessage("Book Title is required."),
    body("description").optional({ checkFalsy: true }).trim(),
    body("price")
      .notEmpty()
      .withMessage("Price is required.")
      .isNumeric()
      .withMessage("Price must be a number.")
      .toFloat()
      .isFloat({ min: 0.0 })
      .withMessage("Price cannot be negative."),
    body("currency")
      .optional()
      .trim()
      .isLength({ min: 3, max: 3 })
      .withMessage("Currency must be a 3-letter code (e.g., INR).")
      .toUpperCase(),
  ];
};

module.exports = {
  bookUploadRules,
};
