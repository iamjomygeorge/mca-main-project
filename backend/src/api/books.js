const express = require("express");
const pool = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");
const { upload, uploadFileToS3 } = require("../services/fileUpload");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const allBooks = await pool.query(
      `SELECT
         b.id,
         b.title,
         b.description,
         b.cover_image_url,
         b.created_at,
         a.name AS author_name,
         b.featured
       FROM books b
       JOIN authors a ON b.author_id = a.id
       ORDER BY b.created_at DESC`
    );
    res.json(allBooks.rows);
  } catch (err) {
    console.error("Get All Books Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const featuredBooks = await pool.query(
      `SELECT
               b.id,
               b.title,
               b.description,
               b.cover_image_url,
               b.created_at,
               a.name AS author_name
             FROM books b
             JOIN authors a ON b.author_id = a.id
             WHERE b.featured = true
             ORDER BY b.created_at DESC`
    );
    res.json(featuredBooks.rows);
  } catch (err) {
    console.error("Get Featured Books Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await pool.query(
      `SELECT
         b.*,
         a.name AS author_name
       FROM books b
       JOIN authors a ON b.author_id = a.id
       WHERE b.id = $1`,
      [id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: "Book not found." });
    }

    res.json(book.rows[0]);
  } catch (err) {
    console.error("Get Single Book Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;