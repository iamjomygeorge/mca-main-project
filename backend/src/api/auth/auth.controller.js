const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../../config/database");
const { send2faEmail } = require("../../services/email.service");
const { OAuth2Client } = require("google-auth-library");
const {
  ACCESS_TOKEN_EXPIRY,
  generateTokens,
  saveRefreshToken,
  setRefreshCookie,
  generateCsrfState,
} = require("./auth.utils");

const saltRounds = 10;
const OTP_EXPIRY_MINUTES = 10;

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

exports.register = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { fullName, email, password, username, role } = req.body;

    const userRole = role === "AUTHOR" ? "AUTHOR" : "READER";

    if (userRole === "AUTHOR") {
      if (!password) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Password is required for author registration." });
      }
      if (!username) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Username is required for author registration." });
      }
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
        throw new Error("Internal error: Author username missing.");
      }

      await client.query(
        "INSERT INTO authors (name, user_id) VALUES ($1, $2)",
        [newUser.username, newUser.id]
      );
    }

    const { accessToken, refreshToken } = generateTokens(newUser);
    await saveRefreshToken(client, newUser.id, refreshToken, req);

    await client.query("COMMIT");

    setRefreshCookie(res, refreshToken);

    req.log.info(
      { userId: newUser.id, role: newUser.role },
      "New user registered"
    );

    const {
      password_hash,
      two_factor_otp,
      two_factor_otp_expiry,
      google_id,
      ...safeUser
    } = newUser;
    res.status(201).json({ user: safeUser, token: accessToken });
  } catch (err) {
    await client.query("ROLLBACK");
    req.log.error(err, "Registration Error");
    if (err.code === "23505") {
      let field = "email or username";
      if (err.constraint === "users_email_key") field = "email address";
      if (err.constraint === "users_username_key") field = "username";
      return res.status(400).json({
        error: `An account with this ${field} already exists.`,
      });
    }
    next(err);
  } finally {
    client.release();
  }
};

exports.login = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { email, password } = req.body;

    const userResult = await client.query(
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

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      req.log.warn({ email }, "Failed login: Invalid password");
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (user.two_factor_enabled) {
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const otpHash = await bcrypt.hash(otpCode, saltRounds);
      const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

      await client.query(
        "UPDATE users SET two_factor_otp = $1, two_factor_otp_expiry = $2 WHERE id = $3",
        [otpHash, expiryTime, user.id]
      );

      try {
        await send2faEmail(user.email, user.full_name, otpCode);
      } catch (emailError) {
        req.log.error(emailError, "Failed to send 2FA email");
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
      const { accessToken, refreshToken } = generateTokens(user);
      await saveRefreshToken(client, user.id, refreshToken, req);

      setRefreshCookie(res, refreshToken);

      req.log.info({ userId: user.id }, "User logged in successfully");
      res.json({ token: accessToken });
    }
  } catch (err) {
    req.log.error(err, "Login Error");
    next(err);
  } finally {
    client.release();
  }
};

exports.login2fa = async (req, res, next) => {
  const client = await pool.connect();
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
      return res.status(401).json({ error: "Invalid or expired session." });
    }

    if (decoded.scope !== "2fa_login") {
      return res.status(401).json({ error: "Invalid token scope." });
    }

    const { userId } = decoded;

    const otpResult = await client.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = otpResult.rows[0];

    if (!user || !user.two_factor_otp) {
      return res.status(400).json({ error: "2FA not initiated." });
    }

    if (new Date() > new Date(user.two_factor_otp_expiry)) {
      return res.status(400).json({ error: "Verification code expired." });
    }

    const isCodeValid = await bcrypt.compare(otpCode, user.two_factor_otp);

    if (!isCodeValid) {
      return res.status(401).json({ error: "Invalid verification code." });
    }

    await client.query(
      "UPDATE users SET two_factor_otp = NULL, two_factor_otp_expiry = NULL WHERE id = $1",
      [userId]
    );

    const { accessToken, refreshToken } = generateTokens(user);
    await saveRefreshToken(client, user.id, refreshToken, req);

    setRefreshCookie(res, refreshToken);

    req.log.info({ userId }, "User logged in via 2FA");
    res.json({ token: accessToken });
  } catch (err) {
    req.log.error(err, "Login 2FA Verify Error");
    next(err);
  } finally {
    client.release();
  }
};

exports.refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token missing." });
  }

  const client = await pool.connect();
  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const result = await client.query(
      `SELECT rt.*, u.role 
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      res.clearCookie("refreshToken");
      return res
        .status(403)
        .json({ error: "Invalid or expired refresh token." });
    }

    const tokenRecord = result.rows[0];

    const payload = { userId: tokenRecord.user_id, role: tokenRecord.role };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    res.json({ token: newAccessToken });
  } catch (err) {
    res.clearCookie("refreshToken");
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Invalid refresh token." });
    }
    req.log.error(err, "Refresh Token Error");
    next(err);
  } finally {
    client.release();
  }
};

exports.logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    try {
      await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [
        tokenHash,
      ]);
    } catch (err) {
      req.log.error(err, "Logout DB cleanup error");
    }
  }

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully." });
};

exports.googleAuth = (req, res) => {
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
};

exports.googleCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const storedState = req.cookies?.oauth_state;

  res.clearCookie("oauth_state");

  if (error || !code || !state || !storedState || state !== storedState) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  const client = await pool.connect();
  try {
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    });

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const googleId = payload.sub;
    const fullName = payload.name;

    await client.query("BEGIN");

    let userResult = await client.query(
      "SELECT * FROM users WHERE google_id = $1",
      [googleId]
    );
    let user = userResult.rows[0];

    if (!user) {
      userResult = await client.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      user = userResult.rows[0];

      if (user) {
        if (user.role === "AUTHOR") {
          await client.query("ROLLBACK");
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=author_google_signin_prohibited`
          );
        }
        await client.query(
          "UPDATE users SET google_id = $1, auth_method = 'google' WHERE id = $2",
          [googleId, user.id]
        );
        user = (
          await client.query("SELECT * FROM users WHERE id = $1", [user.id])
        ).rows[0];
      } else {
        const newUser = await client.query(
          "INSERT INTO users (full_name, email, google_id, role, auth_method) VALUES ($1, $2, $3, 'READER', 'google') RETURNING *",
          [fullName, email, googleId]
        );
        user = newUser.rows[0];
      }
    }

    if (user.role !== "READER") {
      await client.query("ROLLBACK");
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=invalid_role_google`
      );
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await saveRefreshToken(client, user.id, refreshToken, req);

    await client.query("COMMIT");

    setRefreshCookie(res, refreshToken);

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    req.log.error(err, "Google OAuth Error");
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  } finally {
    client.release();
  }
};
