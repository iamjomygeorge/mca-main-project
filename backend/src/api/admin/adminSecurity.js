const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../../config/database");

const { passwordChangeRules } = require("./validator");
const validate = require("../../middleware/validate");

const { send2faEmail } = require("../../services/emailService");
const crypto = require("crypto");

const router = express.Router();
const saltRounds = 10;
const OTP_EXPIRY_MINUTES = 10;

router.put("/password", passwordChangeRules(), validate, async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1 AND role = $2",
      [userId, "ADMIN"]
    );
    if (userResult.rows.length === 0) {
      console.warn(
        `Admin user ${userId} not found during password update attempt.`
      );
      return res.status(404).json({ error: "Admin user not found." });
    }
    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isPasswordValid) {
      console.warn(
        `Incorrect current password attempt for admin user ${userId}.`
      );
      return res.status(401).json({ error: "Incorrect current password." });
    }
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newPasswordHash,
      userId,
    ]);
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Admin Change Password Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/2fa/enable-request", async (req, res) => {
  const { userId } = req.user;
  try {
    const userResult = await pool.query(
      "SELECT email, full_name, two_factor_enabled FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    const { email, full_name, two_factor_enabled } = userResult.rows[0];

    if (two_factor_enabled) {
      return res.status(400).json({ error: "2FA is already enabled." });
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otpCode, saltRounds);
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    await pool.query(
      "UPDATE users SET two_factor_otp = $1, two_factor_otp_expiry = $2 WHERE id = $3",
      [otpHash, expiryTime, userId]
    );

    await send2faEmail(email, full_name, otpCode);

    res.json({ message: `A verification code has been sent to ${email}.` });
  } catch (err) {
    console.error("Admin 2FA Enable Request Error:", err);
    res.status(500).json({
      error: "Internal Server Error. Could not send verification email.",
    });
  }
});

router.post("/2fa/enable-verify", async (req, res) => {
  const { userId } = req.user;
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ error: "Verification code (token) is required." });
  }

  try {
    const otpResult = await pool.query(
      "SELECT two_factor_otp, two_factor_otp_expiry FROM users WHERE id = $1",
      [userId]
    );

    if (otpResult.rows.length === 0 || !otpResult.rows[0].two_factor_otp) {
      return res
        .status(400)
        .json({ error: "2FA setup was not initiated. Please try again." });
    }

    const { two_factor_otp: otpHash, two_factor_otp_expiry: expiryTime } =
      otpResult.rows[0];

    if (new Date() > new Date(expiryTime)) {
      await pool.query(
        "UPDATE users SET two_factor_otp = NULL, two_factor_otp_expiry = NULL WHERE id = $1",
        [userId]
      );
      return res.status(400).json({
        error: "Your verification code has expired. Please try again.",
      });
    }

    const isCodeValid = await bcrypt.compare(token, otpHash);

    if (!isCodeValid) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    await pool.query(
      "UPDATE users SET two_factor_enabled = true, two_factor_otp = NULL, two_factor_otp_expiry = NULL WHERE id = $1",
      [userId]
    );

    res.json({ message: "Two-Factor Authentication enabled successfully." });
  } catch (err) {
    console.error("Admin 2FA Verify Error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error during 2FA verification." });
  }
});

router.post("/2fa/disable", async (req, res) => {
  const { userId } = req.user;
  const { currentPassword } = req.body;

  if (!currentPassword) {
    return res
      .status(400)
      .json({ error: "Current password is required to disable 2FA." });
  }

  try {
    const userResult = await pool.query(
      "SELECT password_hash, two_factor_enabled FROM users WHERE id = $1 AND role = $2",
      [userId, "ADMIN"]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    const user = userResult.rows[0];

    if (!user.two_factor_enabled) {
      return res.status(400).json({ error: "2FA is not currently enabled." });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    await pool.query(
      "UPDATE users SET two_factor_enabled = false, two_factor_otp = NULL, two_factor_otp_expiry = NULL WHERE id = $1",
      [userId]
    );

    res.json({ message: "Two-Factor Authentication disabled successfully." });
  } catch (err) {
    console.error("Admin 2FA Disable Error:", err);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = router;
