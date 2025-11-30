const { body } = require("express-validator");

const contactRules = () => {
  return [
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required.")
      .isLength({ min: 2 })
      .withMessage("Full name must be at least 2 characters long.")
      .escape(),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message cannot be empty.")
      .isLength({ min: 10 })
      .withMessage("Message must be at least 10 characters long.")
      .escape(),
  ];
};

module.exports = {
  contactRules,
};
