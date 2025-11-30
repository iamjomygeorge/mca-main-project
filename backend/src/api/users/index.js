const express = require("express");
const pool = require("../../config/database");
const authenticateToken = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const userProfile = await pool.query(
      "SELECT id, full_name, username, email, role, created_at, two_factor_enabled FROM users WHERE id = $1",
      [userId]
    );

    if (userProfile.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(userProfile.rows[0]);
  } catch (err) {
    req.log.error(err, "Get Profile Error");
    next(err);
  }
});

module.exports = router;
