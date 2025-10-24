const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const crypto = require("crypto");
const { send2faEmail } = require("../services/emailService");

const {
  registrationRules,
  loginRules,
  validate,
} = require("../middleware/authValidator");

const router = express.Router();

const saltRounds = 10;
const OTP_EXPIRY_MINUTES = 10;

router.post("/register", registrationRules(), validate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { fullName, email, password, username, role } = req.body;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userRole = role === "AUTHOR" ? "AUTHOR" : "READER";

    const newUserRes = await client.query(
      "INSERT INTO users (full_name, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [fullName, username || null, email, passwordHash, userRole]
    );
    const newUser = newUserRes.rows[0];

    if (newUser.role === "AUTHOR") {
      await client.query(
        "INSERT INTO authors (name, user_id) VALUES ($1, $2)",
        [newUser.username, newUser.id]
      );
    }

    await client.query("COMMIT");

    res.status(201).json(newUser);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Registration Error:", err.message);
    if (err.code === "23505") {
      return res.status(400).json({
        error: "An account with this email or username already exists.",
      });
    }
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
});

router.post("/login", loginRules(), validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (user.two_factor_enabled) {
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const otpHash = await bcrypt.hash(otpCode, saltRounds);
      const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

      await pool.query(
        "UPDATE users SET two_factor_otp = $1, two_factor_otp_expiry = $2 WHERE id = $3",
        [otpHash, expiryTime, user.id]
      );

      await send2faEmail(user.email, otpCode);

      const tempPayload = { userId: user.id, scope: "2fa_login" };
      const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET, {
        expiresIn: `${OTP_EXPIRY_MINUTES}m`,
      });

      return res.json({
        twoFactorRequired: true,
        tempToken: tempToken,
        message: `A verification code has been sent to ${user.email}.`,
      });
    } else {
      const payload = {
        userId: user.id,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
    }
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login-2fa", async (req, res) => {
  const { tempToken, token: otpCode } = req.body;

  if (!tempToken || !otpCode) {
    return res
      .status(400)
      .json({ error: "Temporary token and OTP code are required." });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Invalid or expired session. Please log in again." });
    }

    if (decoded.scope !== "2fa_login") {
      return res.status(401).json({ error: "Invalid token scope." });
    }

    const { userId } = decoded;

    const otpResult = await pool.query(
      "SELECT two_factor_otp, two_factor_otp_expiry, role FROM users WHERE id = $1",
      [userId]
    );

    if (otpResult.rows.length === 0 || !otpResult.rows[0].two_factor_otp) {
      return res.status(400).json({
        error: "2FA verification was not initiated. Please log in again.",
      });
    }

    const {
      two_factor_otp: otpHash,
      two_factor_otp_expiry: expiryTime,
      role,
    } = otpResult.rows[0];

    if (new Date() > new Date(expiryTime)) {
      await pool.query(
        "UPDATE users SET two_factor_otp = NULL, two_factor_otp_expiry = NULL WHERE id = $1",
        [userId]
      );
      return res.status(400).json({
        error: "Your verification code has expired. Please log in again.",
      });
    }

    const isCodeValid = await bcrypt.compare(otpCode, otpHash);

    if (!isCodeValid) {
      return res.status(401).json({ error: "Invalid verification code." });
    }

    await pool.query(
      "UPDATE users SET two_factor_otp = NULL, two_factor_otp_expiry = NULL WHERE id = $1",
      [userId]
    );

    const payload = {
      userId: userId,
      role: role,
    };
    const finalToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: finalToken });
  } catch (err) {
    console.error("Login 2FA Verify Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;