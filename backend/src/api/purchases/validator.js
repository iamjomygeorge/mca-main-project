const { body } = require("express-validator");

const purchaseInitiateRules = () => {
  return [body("bookId").isUUID().withMessage("Valid Book ID is required.")];
};

module.exports = {
  purchaseInitiateRules,
};
