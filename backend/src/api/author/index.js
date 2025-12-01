const express = require("express");
const pool = require("../../config/database");
const authenticateToken = require("../../middleware/auth.middleware");
const isAuthor = require("../../middleware/author.middleware");
const {
  upload,
  uploadFileToS3,
  deleteFileFromS3,
  cleanupLocalFile,
} = require("../../services/storage.service");

const { bookUploadRules } = require("./author.validator");
const validate = require("../../middleware/validation.middleware");

const router = express.Router();

router.use(authenticateToken, isAuthor);

const transformBooks = (books, req) => {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const baseUrl = `${protocol}://${host}`;

  return books.map((book) => ({
    ...book,
    cover_image_url: book.cover_image_url
      ? `${baseUrl}/api/books/${book.id}/cover`
      : null,
  }));
};

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
    req.log.error(error, "Error fetching author overview stats");
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

    res.json(transformBooks(booksResult.rows, req));
  } catch (err) {
    req.log.error(err, "Get Author's Books Error");
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

    let bookFileKey = null;
    let coverImageKey = null;

    const bookFile = req.files?.["bookFile"]?.[0];
    const coverImageFile = req.files?.["coverImageFile"]?.[0];

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

      bookFileKey = await uploadFileToS3(
        bookFile.path,
        bookFile.originalname,
        bookFile.mimetype,
        "books/author"
      );
      coverImageKey = await uploadFileToS3(
        coverImageFile.path,
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
          bookFileKey,
          coverImageKey,
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

      req.log.info(
        { bookId: newBook.id, authorId },
        "Author uploaded new book"
      );
      res.status(201).json(newBook);
    } catch (err) {
      await client.query("ROLLBACK");
      req.log.error(err, "Author Book Upload Error");

      if (bookFileKey) await deleteFileFromS3(bookFileKey);
      if (coverImageKey) await deleteFileFromS3(coverImageKey);

      next(err);
    } finally {
      if (bookFile) await cleanupLocalFile(bookFile.path);
      if (coverImageFile) await cleanupLocalFile(coverImageFile.path);
      client.release();
    }
  }
);

module.exports = router;
