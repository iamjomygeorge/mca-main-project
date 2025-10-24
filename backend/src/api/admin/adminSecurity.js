const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../../config/database");
const authenticateToken = require("../../middleware/authenticateToken");
const {
  passwordChangeRules,
  validate,
} = require("../../middleware/authValidator");

const router = express.Router();
const saltRounds = 10;

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Forbidden: Access is restricted to administrators." });
  }
};

router.put(
  "/password",
  authenticateToken,
  isAdmin,
  passwordChangeRules(),
  validate,
  async (req, res) => {
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
  }
);

module.exports = router;