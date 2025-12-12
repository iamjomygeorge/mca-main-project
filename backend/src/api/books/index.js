const express = require("express");
const pool = require("../../config/database");
const optionalAuthenticateToken = require("../../middleware/optional-auth.middleware");
const { getFileStream } = require("../../services/storage.service");
const jwt = require("jsonwebtoken");
const { bookIdRules } = require("./books.validator");
const validate = require("../../middleware/validation.middleware");
const { getBaseUrl } = require("../../utils/url.utils");

const router = express.Router();

const generateBookUrls = (book, req) => {
  const baseUrl = getBaseUrl(req);

  let coverUrl = null;
  if (book.cover_image_url) {
    if (book.cover_image_url.startsWith("covers/")) {
      coverUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${book.cover_image_url}`;
    } else {
      coverUrl = `${baseUrl}/api/books/${book.id}/cover`;
    }
  }

  return {
    ...book,
    cover_image_url: coverUrl,
    book_file_url: null,
  };
};

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const allBooks = await pool.query(
      `SELECT
         b.id, b.title, b.description, b.cover_image_url, b.created_at, b.featured,
         a.name AS author_name
       FROM books b
       JOIN authors a ON b.author_id = a.id
       WHERE b.deleted_at IS NULL
       ORDER BY b.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const transformedBooks = allBooks.rows.map((book) =>
      generateBookUrls(book, req)
    );
    res.json(transformedBooks);
  } catch (err) {
    req.log.error(err, "Get All Books Error");
    next(err);
  }
});

router.get("/featured", async (req, res, next) => {
  try {
    const featuredBooks = await pool.query(
      `SELECT
         b.id, b.title, b.description, b.cover_image_url, b.created_at, b.featured,
         a.name AS author_name
       FROM books b
       JOIN authors a ON b.author_id = a.id
       WHERE b.featured = true AND b.deleted_at IS NULL
       ORDER BY b.created_at DESC
       LIMIT 10`
    );

    const transformedBooks = featuredBooks.rows.map((book) =>
      generateBookUrls(book, req)
    );
    res.json(transformedBooks);
  } catch (err) {
    req.log.error(err, "Get Featured Books Error");
    next(err);
  }
});

router.get("/:id/cover", bookIdRules(), validate, async (req, res, next) => {
  const { id: bookId } = req.params;
  try {
    const bookResult = await pool.query(
      "SELECT cover_image_url FROM books WHERE id = $1",
      [bookId]
    );

    if (bookResult.rows.length === 0 || !bookResult.rows[0].cover_image_url) {
      return res.status(404).json({ error: "Cover not found." });
    }

    const s3Key = bookResult.rows[0].cover_image_url;

    if (s3Key.startsWith("covers/")) {
      const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      return res.redirect(s3Url);
    }

    let contentType = "image/jpeg";
    if (s3Key.match(/\.png$/i)) contentType = "image/png";
    if (s3Key.match(/\.webp$/i)) contentType = "image/webp";

    const fileStream = await getFileStream(s3Key);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    fileStream.pipe(res);
  } catch (err) {
    req.log.error(err, "Cover Image Stream Error");
    next(err);
  }
});

router.get("/:id/content", bookIdRules(), validate, async (req, res, next) => {
  const { id: bookId } = req.params;
  const token = req.query.token;
  let userId = null;

  try {
    const bookResult = await pool.query(
      "SELECT book_file_url, price FROM books WHERE id = $1",
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found." });
    }

    const book = bookResult.rows[0];
    const isFree = parseFloat(book.price) <= 0;

    if (!isFree) {
      if (!token) return res.status(401).json({ error: "Unauthorized." });

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        userId = user.userId;
      } catch (err) {
        return res.status(403).json({ error: "Invalid token." });
      }

      const ownershipCheck = await pool.query(
        "SELECT 1 FROM user_library WHERE user_id = $1 AND book_id = $2",
        [userId, bookId]
      );

      if (ownershipCheck.rows.length === 0) {
        return res
          .status(403)
          .json({ error: "Access denied. You do not own this book." });
      }
    }

    const fileStream = await getFileStream(book.book_file_url);
    res.setHeader("Content-Type", "application/epub+zip");
    fileStream.pipe(res);
  } catch (err) {
    req.log.error(err, "Secure Content Stream Error");
    next(err);
  }
});

router.get(
  "/:id",
  optionalAuthenticateToken,
  bookIdRules(),
  validate,
  async (req, res, next) => {
    try {
      const { id: bookId } = req.params;
      const userId = req.user ? req.user.userId : null;

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

      if (bookData.deleted_at && !isOwned) {
        return res.status(404).json({ error: "This book has been removed." });
      }

      const isFree = parseFloat(bookData.price) <= 0;
      const baseUrl = getBaseUrl(req);

      if (bookData.cover_image_url) {
        if (bookData.cover_image_url.startsWith("covers/")) {
          bookData.cover_image_url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${bookData.cover_image_url}`;
        } else {
          bookData.cover_image_url = `${baseUrl}/api/books/${bookId}/cover`;
        }
      }

      if (isOwned || isFree) {
        const token = req.headers["authorization"]
          ? req.headers["authorization"].split(" ")[1]
          : "";
        bookData.book_file_url = `${baseUrl}/api/books/${bookId}/content?token=${token}`;
      } else {
        delete bookData.book_file_url;
      }

      const responseData = { ...bookData, isOwned };
      res.json(responseData);
    } catch (err) {
      req.log.error(err, "Get Single Book Error");
      next(err);
    }
  }
);

module.exports = router;
