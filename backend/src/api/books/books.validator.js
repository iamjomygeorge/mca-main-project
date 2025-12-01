const { param } = require("express-validator");

const bookIdRules = () => {
  return [param("id").isUUID().withMessage("Invalid Book ID format.")];
};

module.exports = {
  bookIdRules,
};
