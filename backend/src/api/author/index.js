const express = require("express");
const pool = require("../../config/database");
const authenticateToken = require("../../middleware/auth.middleware");
const isAuthor = require("../../middleware/author.middleware");
const {
  upload,
  uploadFileToS3,
  deleteFileFromS3,
} = require("../../services/storage.service");

const { bookUploadRules } = require("./author.validator");
const validate = require("../../middleware/validation.middleware");

const router = express.Router();

router.use(authenticateToken, isAuthor);

router.get("/overview", async (req, res, next) => {
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
    next(error);
  }
});

router.get("/my-books", async (req, res, next) => {
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
         b.id, b.title, b.description, b.cover_image_url, b.created_at, b.featured,
         a.name AS author_name
       FROM books b
       JOIN authors a ON b.author_id = a.id
       WHERE b.author_id = $1
       ORDER BY b.created_at DESC`,
      [authorId]
    );
    res.json(booksResult.rows);
  } catch (err) {
    console.error("Get Author's Books Error:", err.message);
    next(err);
  }
});

router.post(
  "/books",
  upload.fields([
    { name: "bookFile", maxCount: 1 },
    { name: "coverImageFile", maxCount: 1 },
  ]),
  bookUploadRules(),
  validate,
  async (req, res, next) => {

    const client = await pool.connect();

    let bookFileUrl = null;
    let coverImageUrl = null;

    try {
      const userId = req.user.userId;

      const authorResult = await client.query(
        "SELECT id FROM authors WHERE user_id = $1",
        [userId]
      );

      if (authorResult.rows.length === 0) {
        return res.status(404).json({ error: "Author profile not found." });
      }

      const authorId = authorResult.rows[0].id;

      const { title, description, price, currency } = req.body;
      const bookFile = req.files?.["bookFile"]?.[0];
      const coverImageFile = req.files?.["coverImageFile"]?.[0];

      if (!bookFile) {
        return res
          .status(400)
          .json({ errors: ["Book file (EPUB) is required."] });
      }
      if (!coverImageFile) {
        return res.status(400).json({ errors: ["Cover image is required."] });
      }

      await client.query("BEGIN");

      const finalCurrency = currency || "INR";

      bookFileUrl = await uploadFileToS3(
        bookFile.buffer,
        bookFile.originalname,
        bookFile.mimetype,
        "books/author"
      );
      coverImageUrl = await uploadFileToS3(
        coverImageFile.buffer,
        coverImageFile.originalname,
        coverImageFile.mimetype,
        "covers/author"
      );

      const newBookResult = await client.query(
        `INSERT INTO books
           (author_id, title, description, book_file_url, cover_image_url, price, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          authorId,
          title,
          description || null,
          bookFileUrl,
          coverImageUrl,
          parseFloat(price).toFixed(2),
          finalCurrency,
        ]
      );
      const newBook = newBookResult.rows[0];

      await client.query(
        "INSERT INTO user_library (user_id, book_id) VALUES ($1, $2) ON CONFLICT (user_id, book_id) DO NOTHING",
        [userId, newBook.id]
      );

      await client.query("COMMIT");

      res.status(201).json(newBook);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Author Book Upload Error:", err.message, err.stack);

      if (bookFileUrl) await deleteFileFromS3(bookFileUrl);
      if (coverImageUrl) await deleteFileFromS3(coverImageUrl);

      next(err);
    } finally {
      client.release();
    }
  }
);

module.exports = router;
