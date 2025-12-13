const express = require("express");
const pool = require("../../config/database");
const fs = require("fs");
const {
  upload,
  uploadFileToS3,
  deleteFileFromS3,
  cleanupLocalFile,
} = require("../../services/storage.service");
const {
  calculateFileHash,
  notarizeBook,
  retryNotarizations,
} = require("../../services/blockchain.service");

const { bookUploadRules } = require("./admin.validator");
const validate = require("../../middleware/validation.middleware");
const { getBaseUrl } = require("../../utils/url.utils");

const router = express.Router();

router.post("/retry-notarization", async (req, res, next) => {
  try {
    const { limit = 10 } = req.body;

    const result = await pool.query(
      `SELECT id, file_hash FROM books 
       WHERE (blockchain_tx_hash IS NULL OR blockchain_tx_hash = '') 
       AND file_hash IS NOT NULL
       LIMIT $1`,
      [limit]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No books need notarization retry." });
    }

    const books = result.rows;
    const retryResults = await retryNotarizations(books);

    let successCount = 0;
    for (const res of retryResults) {
      if (res.txHash) {
        await pool.query(
          "UPDATE books SET blockchain_tx_hash = $1 WHERE id = $2",
          [res.txHash, res.id]
        );
        successCount++;
      }
    }

    res.json({
      message: `Retried ${books.length} books. Successfully initiated: ${successCount}`,
      details: retryResults,
    });
  } catch (err) {
    req.log.error(err, "Retry Notarization Error");
    next(err);
  }
});

router.post(
  "/",
  upload.fields([
    { name: "coverImageFile", maxCount: 1 },
    { name: "bookFile", maxCount: 1 },
  ]),
  bookUploadRules(),
  validate,
  async (req, res, next) => {
    const client = await pool.connect();

    let bookFileKey = null;
    let coverImageKey = null;

    const bookFile = req.files["bookFile"] ? req.files["bookFile"][0] : null;
    const coverImageFile = req.files["coverImageFile"]
      ? req.files["coverImageFile"][0]
      : null;

    try {
      const {
        title,
        description,
        authorId: existingAuthorId,
        newAuthorName,
        genre,
        pageCount,
      } = req.body;

      if (!bookFile) {
        return res.status(400).json({ error: "Book file (EPUB) is required." });
      }

      const fileHash = await calculateFileHash(bookFile.path);

      await client.query("BEGIN");

      let authorId = existingAuthorId;

      if (newAuthorName) {
        const existingAuthorResult = await client.query(
          "SELECT id FROM authors WHERE LOWER(name) = LOWER($1)",
          [newAuthorName.trim()]
        );

        if (existingAuthorResult.rows.length > 0) {
          authorId = existingAuthorResult.rows[0].id;
        } else {
          const newAuthorResult = await client.query(
            "INSERT INTO authors (name, is_simulated) VALUES ($1, $2) RETURNING id",
            [newAuthorName.trim(), false]
          );
          authorId = newAuthorResult.rows[0].id;
        }
      }

      if (!authorId) {
        throw new Error("Could not determine author ID.");
      }

      bookFileKey = await uploadFileToS3(
        bookFile.path,
        bookFile.originalname,
        bookFile.mimetype,
        "books/classic"
      );

      if (coverImageFile) {
        coverImageKey = await uploadFileToS3(
          coverImageFile.path,
          coverImageFile.originalname,
          coverImageFile.mimetype,
          "covers/classic"
        );
      }

      const newBookResult = await client.query(
        `INSERT INTO books 
          (title, description, author_id, book_file_url, cover_image_url, file_hash, blockchain_tx_hash, genre, page_count, is_simulated) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [
          title,
          description,
          authorId,
          bookFileKey,
          coverImageKey,
          fileHash,
          null,
          genre || null,
          pageCount || 300,
          false,
        ]
      );

      await client.query("COMMIT");

      const newBook = newBookResult.rows[0];

      let coverUrl = null;
      if (newBook.cover_image_url) {
        if (newBook.cover_image_url.startsWith("covers/")) {
          coverUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newBook.cover_image_url}`;
        } else {
          const baseUrl = getBaseUrl(req);
          coverUrl = `${baseUrl}/api/books/${newBook.id}/cover`;
        }
      }

      req.log.info({ bookId: newBook.id }, "Book created in DB.");

      let finalTxHash = null;
      try {
        finalTxHash = await notarizeBook(fileHash);
        if (finalTxHash) {
          await pool.query(
            "UPDATE books SET blockchain_tx_hash = $1 WHERE id = $2 RETURNING blockchain_tx_hash",
            [finalTxHash, newBook.id]
          );
          req.log.info(
            { bookId: newBook.id, txHash: finalTxHash },
            "Blockchain hash updated."
          );
          newBook.blockchain_tx_hash = finalTxHash;
        }
      } catch (bcError) {
        req.log.error(
          bcError,
          "Post-upload notarization failed. Book exists but has no txHash."
        );
      }

      const responseBook = {
        ...newBook,
        cover_image_url: coverUrl,
        book_file_url: null,
      };

      res.status(201).json(responseBook);
    } catch (err) {
      await client.query("ROLLBACK");
      req.log.error(err, "Admin Book Upload Error");

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

router.put("/:id/feature", async (req, res, next) => {
  const { id } = req.params;
  const { feature } = req.body;

  try {
    const updatedBook = await pool.query(
      "UPDATE books SET featured = $1 WHERE id = $2 RETURNING *",
      [feature, id]
    );

    if (updatedBook.rows.length === 0) {
      return res.status(404).json({ error: "Book not found." });
    }

    req.log.info(
      { bookId: id, featured: feature },
      "Book feature status updated"
    );
    res.json(updatedBook.rows[0]);
  } catch (err) {
    req.log.error(err, "Feature Book Error");
    next(err);
  }
});

module.exports = router;
