const express = require("express");
const pool = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");
const isAuthor = require("../middleware/isAuthor");
const { upload, uploadFileToS3 } = require("../services/fileUpload");

const router = express.Router();

router.use(authenticateToken, isAuthor);

router.get("/overview", async (req, res) => {
  try {
    const authorResult = await pool.query(
      "SELECT id FROM authors WHERE user_id = $1",
      [req.user.userId]
    );
    if (authorResult.rows.length === 0) {
      return res.status(404).json({ error: "Author profile not found." });
    }
    const authorId = authorResult.rows[0].id;

    const statsResult = await pool.query(
      "SELECT COUNT(*) FROM books WHERE author_id = $1",
      [authorId]
    );

    const stats = {
      totalBooksPublished: parseInt(statsResult.rows[0].count, 10),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching author overview stats:", error);
    res.status(500).json({ error: "Failed to retrieve author statistics." });
  }
});

router.get("/my-books", async (req, res) => {
  try {
    const authorResult = await pool.query(
      "SELECT id FROM authors WHERE user_id = $1",
      [req.user.userId]
    );
    if (authorResult.rows.length === 0) {
      return res.status(404).json({ error: "Author profile not found." });
    }
    const authorId = authorResult.rows[0].id;

    const booksResult = await pool.query(
      `SELECT
         b.id,
         b.title,
         b.description,
         b.cover_image_url,
         b.created_at,
         a.name AS author_name, -- Keep author_name for consistency if needed elsewhere
         b.featured
       FROM books b
       JOIN authors a ON b.author_id = a.id
       WHERE b.author_id = $1
       ORDER BY b.created_at DESC`,
      [authorId]
    );
    res.json(booksResult.rows);
  } catch (err) {
    console.error("Get Author's Books Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/books",
  upload.fields([
    { name: "bookFile", maxCount: 1 },
    { name: "coverImageFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const authorResult = await pool.query(
        "SELECT id FROM authors WHERE user_id = $1",
        [req.user.userId]
      );

      const authorId = authorResult.rows[0].id;
      const { title, description } = req.body;
      const bookFile = req.files["bookFile"] ? req.files["bookFile"][0] : null;
      const coverImageFile = req.files["coverImageFile"]
        ? req.files["coverImageFile"][0]
        : null;

      if (!title || !bookFile) {
        return res
          .status(400)
          .json({ error: "Title and a book file are required." });
      }
      if (!coverImageFile) {
        return res.status(400).json({ error: "A cover image is required." });
      }

      const bookFileUrl = await uploadFileToS3(
        bookFile.buffer,
        bookFile.originalname,
        bookFile.mimetype,
        "books"
      );

      const coverImageUrl = await uploadFileToS3(
        coverImageFile.buffer,
        coverImageFile.originalname,
        coverImageFile.mimetype,
        "covers"
      );

      const newBook = await pool.query(
        "INSERT INTO books (author_id, title, description, book_file_url, cover_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [authorId, title, description || null, bookFileUrl, coverImageUrl]
      );

      res.status(201).json(newBook.rows[0]);
    } catch (err) {
      console.error("Author Book Upload Error:", err.message, err.stack);
      res
        .status(500)
        .json({ error: "Internal Server Error during book upload." });
    }
  }
);

router.delete("/books/:id", async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const { userId } = req.user;

    const bookResult = await pool.query(
      `SELECT a.user_id
           FROM books b
           JOIN authors a ON b.author_id = a.id
           WHERE b.id = $1`,
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found." });
    }

    const bookAuthorUserId = bookResult.rows[0].user_id;

    if (bookAuthorUserId !== userId) {
      return res.status(403).json({
        error: "Forbidden: You are not authorized to delete this book.",
      });
    }

    await pool.query("DELETE FROM books WHERE id = $1", [bookId]);

    res.sendStatus(204);
  } catch (err) {
    console.error("Author Delete Book Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;