const express = require("express");
const pool = require("../../config/database");
const { upload, uploadFileToS3 } = require("../../services/fileUpload");

const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "coverImageFile", maxCount: 1 },
    { name: "bookFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

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

      if (!title || !bookFile || (!existingAuthorId && !newAuthorName)) {
        return res
          .status(400)
          .json({ error: "Title, author, and a book file are required." });
      }

      let authorId = existingAuthorId;

      if (newAuthorName) {
        const newAuthorResult = await client.query(
          "INSERT INTO authors (name) VALUES ($1) RETURNING id",
          [newAuthorName.trim()]
        );
        authorId = newAuthorResult.rows[0].id;
      }

      if (!authorId) {
        return res
          .status(400)
          .json({ error: "Could not determine author ID." });
      }

      const bookFileUrl = await uploadFileToS3(
        bookFile.buffer,
        bookFile.originalname,
        bookFile.mimetype,
        "books/classic"
      );
      let coverImageUrl = null;
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
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      client.release();
    }
  }
);

router.put("/:id/feature", async (req, res) => {
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
