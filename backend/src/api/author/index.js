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
const {
  calculateFileHash,
  notarizeBook,
} = require("../../services/blockchain.service");

const { bookUploadRules } = require("./author.validator");
const validate = require("../../middleware/validation.middleware");
const { getBaseUrl } = require("../../utils/url.utils");

const router = express.Router();

router.use(authenticateToken, isAuthor);

const transformBooks = (books, req) => {
  const baseUrl = getBaseUrl(req);
  return books.map((book) => {
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
    };
  });
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
         a.name AS author_name,
         b.file_hash, 
         b.blockchain_tx_hash,
         b.genre,
         b.page_count
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
      const { title, description, price, currency, genre, pageCount } =
        req.body;

      if (!bookFile)
        return res
          .status(400)
          .json({ errors: ["Book file (EPUB) is required."] });
      if (!coverImageFile)
        return res.status(400).json({ errors: ["Cover image is required."] });

      const fileHash = await calculateFileHash(bookFile.path);

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
           (author_id, title, description, book_file_url, cover_image_url, price, currency, file_hash, blockchain_tx_hash, genre, page_count, is_simulated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          authorId,
          title,
          description || null,
          bookFileKey,
          coverImageKey,
          parseFloat(price).toFixed(2),
          finalCurrency,
          fileHash,
          null,
          genre || null,
          pageCount || 300,
          false,
        ]
      );
      const newBook = newBookResult.rows[0];

      await client.query(
        "INSERT INTO user_library (user_id, book_id) VALUES ($1, $2) ON CONFLICT (user_id, book_id) DO NOTHING",
        [userId, newBook.id]
      );

      await client.query("COMMIT");

      let txHash = null;
      try {
        txHash = await notarizeBook(fileHash);
        if (txHash) {
          await pool.query(
            "UPDATE books SET blockchain_tx_hash = $1 WHERE id = $2",
            [txHash, newBook.id]
          );
          newBook.blockchain_tx_hash = txHash;
        }
      } catch (bcError) {
        req.log.error(
          bcError,
          "Blockchain notarization failed after DB insert."
        );
      }

      req.log.info(
        { bookId: newBook.id, authorId, txHash },
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

router.delete("/books/:id", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id: bookId } = req.params;
    const authorResult = await client.query(
      "SELECT id FROM authors WHERE user_id = $1",
      [req.user.userId]
    );

    if (authorResult.rows.length === 0) {
      return res.status(404).json({ error: "Author profile not found." });
    }
    const authorId = authorResult.rows[0].id;

    const bookResult = await client.query(
      "SELECT * FROM books WHERE id = $1 AND author_id = $2",
      [bookId, authorId]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found or unauthorized." });
    }

    const book = bookResult.rows[0];

    await client.query("BEGIN");
    await client.query("DELETE FROM user_library WHERE book_id = $1", [bookId]);
    await client.query("DELETE FROM books WHERE id = $1", [bookId]);
    await client.query("COMMIT");

    if (book.book_file_url) await deleteFileFromS3(book.book_file_url);
    if (book.cover_image_url) await deleteFileFromS3(book.cover_image_url);

    req.log.info({ bookId, authorId }, "Author deleted book");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    req.log.error(err, "Delete Book Error");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
