const express = require("express");
const controller = require("./auth.controller");
const { registrationRules, loginRules } = require("./auth.validator");
const validate = require("../../middleware/validation.middleware");
const { authLimiter } = require("../../config/rate-limit");

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  registrationRules(),
  validate,
  controller.register
);
router.post("/login", authLimiter, loginRules(), validate, controller.login);
router.post("/login-2fa", authLimiter, controller.login2fa);
router.post("/refresh", authLimiter, controller.refresh);
router.post("/logout", authLimiter, controller.logout);

router.get("/google", authLimiter, controller.googleAuth);
router.get("/google/callback", authLimiter, controller.googleCallback);

module.exports = router;
