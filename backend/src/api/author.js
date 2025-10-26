const express = require("express");
const pool = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");
const isAuthor = require("../middleware/isAuthor");
const { upload, uploadFileToS3 } = require("../services/fileUpload");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.use(authenticateToken, isAuthor);

router.get("/overview", async (req, res) => {
  try {
    const authorResult = await pool.query(
      "SELECT id FROM authors WHERE user_id = $1",
      [req.user.userId]
    );
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const bookUploadValidationRules = () => [
  body("title").trim().notEmpty().withMessage("Book Title is required."),
  body("description").optional({ checkFalsy: true }).trim(),
  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isNumeric()
    .withMessage("Price must be a number.")
    .toFloat()
    .isFloat({ min: 0.0 })
    .withMessage("Price cannot be negative."),
  body("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code (e.g., INR).")
    .toUpperCase(),
];

router.post(
  "/books",
  upload.fields([
    { name: "bookFile", maxCount: 1 },
    { name: "coverImageFile", maxCount: 1 },
  ]),
  bookUploadValidationRules(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      const authorResult = await pool.query(
        "SELECT id FROM authors WHERE user_id = $1",
        [req.user.userId]
      );
      const authorId = authorResult.rows[0].id;

      const { title, description, price, currency } = req.body;
      const bookFile = req.files?.["bookFile"]?.[0];
      const coverImageFile = req.files?.["coverImageFile"]?.[0];

      if (!bookFile)
        return res
          .status(400)
          .json({ errors: ["Book file (EPUB) is required."] });
      if (!coverImageFile)
        return res.status(400).json({ errors: ["Cover image is required."] });

      const finalCurrency = currency || "INR";

      const bookFileUrl = await uploadFileToS3(
        bookFile.buffer,
        bookFile.originalname,
        bookFile.mimetype,
        "books/author"
      );
      const coverImageUrl = await uploadFileToS3(
        coverImageFile.buffer,
        coverImageFile.originalname,
        coverImageFile.mimetype,
        "covers/author"
      );

      const newBook = await pool.query(
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

      res.status(201).json(newBook.rows[0]);
    } catch (err) {
      console.error("Author Book Upload Error:", err.message, err.stack);
      res
        .status(500)
        .json({ errors: ["Internal Server Error during book upload."] });
    }
  }
);

module.exports = router;
