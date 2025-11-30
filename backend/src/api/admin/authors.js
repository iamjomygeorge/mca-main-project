const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const classicAuthors = await pool.query(
      "SELECT id, name FROM authors WHERE user_id IS NULL ORDER BY name ASC"
    );
    res.json(classicAuthors.rows);
  } catch (err) {
    req.log.error(err, "Get Classic Authors Error");
    next(err);
  }
});

module.exports = router;
