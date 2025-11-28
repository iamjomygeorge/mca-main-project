const express = require("express");
const pool = require("../../config/database");
const {
  upload,
  uploadFileToS3,
  deleteFileFromS3,
} = require("../../services/fileUpload");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const bookUploadValidationRules = () => [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Book Title is required.")
    .escape(),
  body("description").optional({ checkFalsy: true }).trim(),
  body("authorId")
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage("Invalid Author ID."),
  body("newAuthorName")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage("New Author Name must be at least 2 characters.")
    .escape(),
  body().custom((value, { req }) => {
    if (!req.body.authorId && !req.body.newAuthorName) {
      throw new Error(
        "Please select an existing author or provide a new author name."
      );
    }
    return true;
  }),
];

router.post(
  "/",
  upload.fields([
    { name: "coverImageFile", maxCount: 1 },
    { name: "bookFile", maxCount: 1 },
  ]),
  bookUploadValidationRules(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return res.status(400).json({ errors: errorMessages });
    }

    const client = await pool.connect();

    let bookFileUrl = null;
    let coverImageUrl = null;

    try {
      const {
        title,
        description,
        authorId: existingAuthorId,
        newAuthorName,
      } = req.body;

      const bookFile = req.files["bookFile"] ? req.files["bookFile"][0] : null;
      const coverImageFile = req.files["coverImageFile"]
        ? req.files["coverImageFile"][0]
        : null;

      if (!bookFile) {
        return res.status(400).json({ error: "Book file (EPUB) is required." });
      }

      await client.query("BEGIN");

      let authorId = existingAuthorId;

      if (newAuthorName) {
        const newAuthorResult = await client.query(
          "INSERT INTO authors (name) VALUES ($1) RETURNING id",
          [newAuthorName]
        );
        authorId = newAuthorResult.rows[0].id;
      }

      if (!authorId) {
        throw new Error("Could not determine author ID.");
      }

      bookFileUrl = await uploadFileToS3(
        bookFile.buffer,
        bookFile.originalname,
        bookFile.mimetype,
        "books/classic"
      );

      if (coverImageFile) {
        coverImageUrl = await uploadFileToS3(
          coverImageFile.buffer,
          coverImageFile.originalname,
          coverImageFile.mimetype,
          "covers/classic"
        );
      }

      const newBookResult = await client.query(
        "INSERT INTO books (title, description, author_id, book_file_url, cover_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, description, authorId, bookFileUrl, coverImageUrl]
      );

      await client.query("COMMIT");

      res.status(201).json(newBookResult.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Admin Book Upload Error:", err);

      if (bookFileUrl) await deleteFileFromS3(bookFileUrl);
      if (coverImageUrl) await deleteFileFromS3(coverImageUrl);

      next(err);
    } finally {
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

    res.json(updatedBook.rows[0]);
  } catch (err) {
    console.error("Feature Book Error:", err.message);
    next(err);
  }
});

module.exports = router;
