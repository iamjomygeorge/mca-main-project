const express = require("express");
const pool = require("../../config/database");
const {
  upload,
  uploadFileToS3,
  deleteFileFromS3,
  cleanupLocalFile,
} = require("../../services/storage.service");

const { bookUploadRules } = require("./admin.validator");
const validate = require("../../middleware/validation.middleware");

const router = express.Router();

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
      } = req.body;

      if (!bookFile) {
        return res.status(400).json({ error: "Book file (EPUB) is required." });
      }

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
            "INSERT INTO authors (name) VALUES ($1) RETURNING id",
            [newAuthorName.trim()]
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
        "INSERT INTO books (title, description, author_id, book_file_url, cover_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, description, authorId, bookFileKey, coverImageKey]
      );

      await client.query("COMMIT");

      req.log.info(
        { bookId: newBookResult.rows[0].id },
        "Admin uploaded classic book"
      );
      res.status(201).json(newBookResult.rows[0]);
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
