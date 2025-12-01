const express = require("express");
const controller = require("./auth.controller");
const { registrationRules, loginRules } = require("./auth.validator");
const validate = require("../../middleware/validation.middleware");

const router = express.Router();

router.post("/register", registrationRules(), validate, controller.register);
router.post("/login", loginRules(), validate, controller.login);
router.post("/login-2fa", controller.login2fa);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);

router.get("/google", controller.googleAuth);
router.get("/google/callback", controller.googleCallback);

module.exports = router;
