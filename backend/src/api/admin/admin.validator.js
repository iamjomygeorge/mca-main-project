const { body } = require("express-validator");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;"'<>,.?/~\\`|-])[A-Za-z\d !@#$%^&*()_+={}[\]:;"'<>,.?/~\\`|-]{8,}$/;
const passwordErrorMessage =
  "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.";

const passwordChangeRules = () => {
  return [
    body("currentPassword")
      .exists({ checkFalsy: true })
      .withMessage("Current password is required."),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long.")
      .bail()
      .matches(passwordRegex)
      .withMessage(passwordErrorMessage),
  ];
};

const bookUploadRules = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Book Title is required.")
      .escape(),
    body("description").optional({ checkFalsy: true }).trim(),
    body("authorId")
      .optional({ checkFalsy: true })
      .isUUID()
      .withMessage("Invalid Author ID."),
    body("newAuthorName")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("New Author Name must be at least 2 characters.")
      .escape(),
    body().custom((value, { req }) => {
      if (!req.body.authorId && !req.body.newAuthorName) {
        throw new Error(
          "Please select an existing author or provide a new author name."
        );
      }
      return true;
    }),
  ];
};

const messageStatusRules = () => {
  return [
    body("status")
      .isIn(["NEW", "READ", "RESOLVED"])
      .withMessage("Invalid status."),
  ];
};

module.exports = {
  passwordChangeRules,
  bookUploadRules,
  messageStatusRules,
};
