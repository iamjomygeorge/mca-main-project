const express = require("express");
const pool = require("../config/database");
const optionalAuthenticateToken = require("../middleware/optionalAuthenticateToken");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

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
       ORDER BY b.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json(allBooks.rows);
  } catch (err) {
    console.error("Get All Books Error:", err.message);
    next(err);
  }
});

router.get("/featured", async (req, res, next) => {
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
             ORDER BY b.created_at DESC
             LIMIT 10`
    );
    res.json(featuredBooks.rows);
  } catch (err) {
    console.error("Get Featured Books Error:", err.message);
    next(err);
  }
});

router.get("/:id", optionalAuthenticateToken, async (req, res, next) => {
  try {
    const { id: bookId } = req.params;
    const userId = req.user ? req.user.userId : null;

    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(bookId)) {
      return res.status(400).json({ error: "Invalid Book ID format." });
    }

    const bookResult = await pool.query(
      `SELECT
         b.*,
         a.name AS author_name
       FROM books b
       JOIN authors a ON b.author_id = a.id
       WHERE b.id = $1`,
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found." });
    }

    const bookData = bookResult.rows[0];
    let isOwned = false;

    if (userId) {
      const ownershipCheck = await pool.query(
        "SELECT 1 FROM user_library WHERE user_id = $1 AND book_id = $2",
        [userId, bookId]
      );
      if (ownershipCheck.rows.length > 0) {
        isOwned = true;
      }
    }

    const responseData = { ...bookData, isOwned };

    res.json(responseData);
  } catch (err) {
    console.error("Get Single Book Error:", err.message, err.stack);
    next(err);
  }
});

module.exports = router;
