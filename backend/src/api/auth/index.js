const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../config/database");
const crypto = require("crypto");
const { send2faEmail } = require("../../services/email.service");
const { OAuth2Client } = require("google-auth-library");

const { registrationRules, loginRules } = require("./auth.validator");
const validate = require("../../middleware/validation.middleware");

const router = express.Router();

const saltRounds = 10;
const OTP_EXPIRY_MINUTES = 10;

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

function generateCsrfState() {
  return crypto.randomBytes(16).toString("hex");
}

router.post("/register", registrationRules(), validate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { fullName, email, password, username, role } = req.body;

    const userRole = role === "AUTHOR" ? "AUTHOR" : "READER";
    if (userRole === "AUTHOR" && !password) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Password is required for author registration." });
    }
    if (userRole === "AUTHOR" && !username) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Username is required for author registration." });
    }

    const passwordHash = password
      ? await bcrypt.hash(password, saltRounds)
      : null;

    const newUserRes = await client.query(
      "INSERT INTO users (full_name, username, email, password_hash, role, auth_method) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [fullName, username || null, email, passwordHash, userRole, "email"]
    );
    const newUser = newUserRes.rows[0];

    if (newUser.role === "AUTHOR") {
      if (!newUser.username) {
        await client.query("ROLLBACK");
        console.error(
          `Attempted to create author entry without username for user ID: ${newUser.id}`
        );
        return res
          .status(500)
          .json({ error: "Internal error: Author username missing." });
      }
      await client.query(
        "INSERT INTO authors (name, user_id) VALUES ($1, $2)",
        [newUser.username, newUser.id]
      );
    }

    await client.query("COMMIT");

    const {
      password_hash,
      two_factor_otp,
      two_factor_otp_expiry,
      google_id,
      ...safeUser
    } = newUser;
    res.status(201).json(safeUser);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Registration Error:", err);
    if (err.code === "23505") {
      let field = "email or username";
      if (err.constraint === "users_email_key") field = "email address";
      if (err.constraint === "users_username_key") field = "username";
      return res.status(400).json({
        error: `An account with this ${field} already exists.`,
      });
    }
    res
      .status(500)
      .json({ error: "Internal Server Error during registration." });
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

    if (user.auth_method === "google" && !user.password_hash) {
      return res.status(401).json({
        error: "This account uses Google Sign-In. Please log in using Google.",
      });
    }

    if (user.auth_method === "email" && !user.password_hash) {
      console.error(
        `Login Error: User ${user.id} with email auth method has no password hash.`
      );
      return res.status(500).json({
        error: "Account configuration error. Please contact support.",
      });
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

      try {
        await send2faEmail(user.email, user.full_name, otpCode);
      } catch (emailError) {
        console.error("Failed to send 2FA email:", emailError);
      }

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
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error during login." });
  }
});

router.post("/login-2fa", async (req, res) => {
  try {
    const { tempToken, token: otpCode } = req.body;

    if (!tempToken || !otpCode) {
      return res
        .status(400)
        .json({ error: "Temporary token and OTP code are required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ error: "Your session has expired. Please log in again." });
      }
      return res
        .status(401)
        .json({ error: "Invalid session token. Please log in again." });
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
        error:
          "2FA verification was not initiated or already completed. Please log in again.",
      });
    }

    const {
      two_factor_otp: otpHash,
      two_factor_otp_expiry: expiryTime,
      role,
    } = otpResult.rows[0];

    await pool.query(
      "UPDATE users SET two_factor_otp = NULL, two_factor_otp_expiry = NULL WHERE id = $1",
      [userId]
    );

    if (new Date() > new Date(expiryTime)) {
      return res.status(400).json({
        error: "Your verification code has expired. Please log in again.",
      });
    }

    const isCodeValid = await bcrypt.compare(otpCode, otpHash);

    if (!isCodeValid) {
      return res.status(401).json({ error: "Invalid verification code." });
    }

    const payload = {
      userId: userId,
      role: role,
    };
    const finalToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: finalToken });
  } catch (err) {
    console.error("Login 2FA Verify Error:", err);
    if (req.body.tempToken) {
      try {
        const decoded = jwt.decode(req.body.tempToken);
        if (decoded && decoded.userId) {
          await pool.query(
            "UPDATE users SET two_factor_otp = NULL, two_factor_otp_expiry = NULL WHERE id = $1",
            [decoded.userId]
          );
        }
      } catch (clearOtpError) {
        console.error("Error clearing OTP during 2FA failure:", clearOtpError);
      }
    }
    res
      .status(500)
      .json({ error: "Internal Server Error during 2FA verification." });
  }
});

router.get("/google", (req, res) => {
  const state = generateCsrfState();
  res.cookie("oauth_state", state, {
    maxAge: 300000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    state: state,
  });
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const storedState = req.cookies?.oauth_state;

  res.clearCookie("oauth_state", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (error) {
    console.error("Google OAuth Error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=google_access_denied`
    );
  }

  if (!code || !state || !storedState || state !== storedState) {
    console.error("Google OAuth Error: Missing code or state mismatch.");
    return res
      .status(400)
      .redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
  }

  const client = await pool.connect();
  try {
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    });

    if (!tokens.id_token) {
      throw new Error("Google did not return an ID token.");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email;
    const fullName = payload?.name;
    const emailVerified = payload?.email_verified;

    if (!googleId || !email || !fullName) {
      throw new Error(
        "Required user information (ID, email, name) not provided by Google."
      );
    }
    if (!emailVerified) {
      console.warn(`Google OAuth attempt with unverified email: ${email}`);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_email_unverified`
      );
    }

    await client.query("BEGIN");

    let userResult = await client.query(
      "SELECT * FROM users WHERE google_id = $1",
      [googleId]
    );
    let user = userResult.rows[0];

    if (user) {
      if (user.role === "AUTHOR") {
        console.warn(
          `Author user ${user.id} (found by google_id) attempted Google Sign-In.`
        );
        await client.query("ROLLBACK");
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=author_google_signin_prohibited`
        );
      }
      console.log(
        `User ${user.id} found via Google ID ${googleId}. Logging in as READER.`
      );
    } else {
      userResult = await client.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      user = userResult.rows[0];

      if (user) {
        if (user.role === "AUTHOR") {
          console.warn(
            `Author user ${user.id} (found by email) attempted Google Sign-In.`
          );
          await client.query("ROLLBACK");
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=author_google_signin_prohibited`
          );
        }

        console.log(
          `Linking Google ID ${googleId} to existing READER user ${user.id}`
        );
        await client.query(
          "UPDATE users SET google_id = $1, auth_method = $2 WHERE id = $3 AND role = $4",
          [googleId, "google", user.id, "READER"]
        );
        const updatedUserResult = await client.query(
          "SELECT * FROM users WHERE id = $1",
          [user.id]
        );
        user = updatedUserResult.rows[0];
        if (!user || user.google_id !== googleId) {
          await client.query("ROLLBACK");
          throw new Error(
            `Failed to link Google ID for user ${
              user?.id || "unknown"
            }. Role might have changed.`
          );
        }
      } else {
        console.log(
          `Creating new READER user via Google Sign-In for email ${email}`
        );

        const newUserRes = await client.query(
          "INSERT INTO users (full_name, email, google_id, role, auth_method, password_hash, username) VALUES ($1, $2, $3, $4, $5, NULL, NULL) RETURNING *",
          [fullName, email, googleId, "READER", "google"]
        );
        user = newUserRes.rows[0];
        if (!user) {
          await client.query("ROLLBACK");
          throw new Error("Failed to create new user during Google sign-up.");
        }
      }
    }

    if (user.role !== "READER") {
      console.error(
        `Attempting to issue token for non-READER user ${user.id} with role ${user.role} via Google flow.`
      );
      await client.query("ROLLBACK");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=invalid_role_for_google_signin`
      );
    }

    const jwtPayload = {
      userId: user.id,
      role: user.role,
    };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await client.query("COMMIT");

    console.log(
      `Successfully processed Google Sign-In for READER user ${user.id}. Redirecting with token.`
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Google OAuth Callback Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  } finally {
    client.release();
  }
});

module.exports = router;
