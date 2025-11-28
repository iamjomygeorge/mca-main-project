const express = require("express");
const router = express.Router();
const pool = require("../../config/database");

router.get("/overview", async (req, res) => {
  try {
    const [totalBooksResult, totalAuthorsResult, totalReadersResult] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM books"),
        pool.query("SELECT COUNT(*) FROM authors"),
        pool.query("SELECT COUNT(*) FROM users WHERE role = $1", ["READER"]),
      ]);

    const stats = {
      totalBooks: parseInt(totalBooksResult.rows[0].count, 10),
      totalAuthors: parseInt(totalAuthorsResult.rows[0].count, 10),
      totalReaders: parseInt(totalReadersResult.rows[0].count, 10),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    res.status(500).json({ error: "Failed to retrieve overview statistics." });
  }
});

module.exports = router;
