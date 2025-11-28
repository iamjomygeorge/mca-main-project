const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

router.get("/", async (req, res) => {
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