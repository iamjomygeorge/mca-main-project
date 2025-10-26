const express = require("express");
const pool = require("../../config/database");
const router = express.Router();
const authenticateToken = require("../../middleware/authenticateToken");

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Forbidden: Access is restricted to administrators." });
  }
};

router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const classicAuthors = await pool.query(
      "SELECT id, name FROM authors WHERE user_id IS NULL ORDER BY name ASC"
    );
    res.json(classicAuthors.rows);
  } catch (err) {
    console.error("Get Classic Authors Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;