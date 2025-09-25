const express = require("express");
const pool = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");
const { upload, uploadFileToS3 } = require("../services/fileUpload");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
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
       ORDER BY b.created_at DESC`
    );
    res.json(allBooks.rows);
  } catch (err) {
    console.error("Get All Books Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/featured", async (req, res) => {
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
             ORDER BY b.created_at DESC`
    );
    res.json(featuredBooks.rows);
  } catch (err) {
    console.error("Get Featured Books Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await pool.query(
      `SELECT
         b.*,
         a.name AS author_name
       FROM books b
       JOIN authors a ON b.author_id = a.id
       WHERE b.id = $1`,
      [id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: "Book not found." });
    }

    res.json(book.rows[0]);
  } catch (err) {
    console.error("Get Single Book Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/",
  authenticateToken,
  upload.fields([
    { name: "bookFile", maxCount: 1 },
    { name: "coverImageFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (req.user.role !== "AUTHOR") {
        return res
          .status(403)
          .json({ error: "Forbidden: Only authors can upload books." });
      }

      const authorResult = await pool.query(
        "SELECT id FROM authors WHERE user_id = $1",
        [req.user.userId]
      );
      if (authorResult.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Author profile not found for this user." });
      }
      const authorId = authorResult.rows[0].id;

      const { title, description } = req.body;
      const bookFile = req.files["bookFile"][0];
      const coverImageFile = req.files["coverImageFile"]
        ? req.files["coverImageFile"][0]
        : null;

      if (!title || !bookFile) {
        return res
          .status(400)
          .json({ error: "Title and a book file are required." });
      }

      const bookFileUrl = await uploadFileToS3(
        bookFile.buffer,
        bookFile.originalname,
        bookFile.mimetype,
        "books"
      );

      let coverImageUrl = null;
      if (coverImageFile) {
        coverImageUrl = await uploadFileToS3(
          coverImageFile.buffer,
          coverImageFile.originalname,
          coverImageFile.mimetype,
          "covers"
        );
      }

      const newBook = await pool.query(
        "INSERT INTO books (author_id, title, description, book_file_url, cover_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [authorId, title, description, bookFileUrl, coverImageUrl]
      );

      res.status(201).json(newBook.rows[0]);
    } catch (err) {
      console.error("Book Upload Error:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const { userId, role } = req.user;

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

    if (role !== "ADMIN" && bookAuthorUserId !== userId) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You are not authorized to delete this book.",
        });
    }

    await pool.query("DELETE FROM books WHERE id = $1", [bookId]);

    res.sendStatus(204);
  } catch (err) {
    console.error("Delete Book Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
