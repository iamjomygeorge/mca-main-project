const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    errors: extractedErrors,
  });
};

const registrationRules = () => {
  return [
    body('fullName')
      .trim()
      .notEmpty().withMessage('Full name is required.')
      .bail()
      .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters long.')
      .matches(/^[a-zA-Z.'\- ]+$/).withMessage('Please enter a valid full name.')
      .escape(),

    body('email')
      .trim()
      .isEmail().withMessage('Please provide a valid email address.')
      .bail()
      .normalizeEmail()
      .custom(async (email) => {
        const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (rows.length > 0) {
          return Promise.reject('An account with this email address already exists.');
        }
      }),

    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
      .bail()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must contain an uppercase letter, a lowercase letter, a number, and a special character.'),

    body('username')
      .if(body('role').equals('AUTHOR'))
      .trim()
      .notEmpty().withMessage('Username is required for authors.')
      .bail()
      .isLength({ min: 2 }).withMessage('Username must be at least 2 characters long.')
      .matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/).withMessage('Username can only contain letters, numbers, and hyphens, and cannot start or end with a hyphen.')
      .custom(async (username) => {
        const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (rows.length > 0) {
          return Promise.reject('This username is already taken.');
        }
      }),
  ];
};

const loginRules = () => {
  return [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .bail()
      .isEmail().withMessage('Please provide a valid email address.')
      .normalizeEmail(),
      
    body('password')
      .exists({ checkFalsy: true }).withMessage('Password is required.'),
  ];
};

module.exports = {
  registrationRules,
  loginRules,
  validate,
};