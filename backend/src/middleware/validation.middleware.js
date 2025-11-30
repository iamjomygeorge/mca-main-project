const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  req.log.warn(
    { validationErrors: extractedErrors },
    "Request validation failed."
  );

  return res.status(400).json({
    errors: extractedErrors,
  });
};

module.exports = validate;
