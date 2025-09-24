const express = require('express');
const pool = require('../../config/database');
const authenticateToken = require('../../middleware/authenticateToken');
const { upload, uploadFileToS3 } = require('../../services/fileUpload');

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: Access is restricted to administrators." });
  }
};

router.post(
  '/',
  authenticateToken,
  isAdmin,
  upload.fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'coverImageFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, author_name, description } = req.body;
      const bookFile = req.files['bookFile'] ? req.files['bookFile'][0] : null;
      const coverImageFile = req.files['coverImageFile'] ? req.files['coverImageFile'][0] : null;

      if (!title || !bookFile || !author_name) {
        return res.status(400).json({ error: 'Title, author name, and a book file are required.' });
      }

      const bookFileUrl = await uploadFileToS3(
        bookFile.buffer,
        bookFile.originalname,
        bookFile.mimetype,
        'books'
      );

      let coverImageUrl = null;
      if (coverImageFile) {
        coverImageUrl = await uploadFileToS3(
          coverImageFile.buffer,
          coverImageFile.originalname,
          coverImageFile.mimetype,
          'covers'
        );
      }

      const newBook = await pool.query(
        'INSERT INTO books (author_name, title, description, book_file_url, cover_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [author_name, title, description, bookFileUrl, coverImageUrl]
      );

      res.status(201).json(newBook.rows[0]);

    } catch (err) {
      console.error('Admin Book Upload Error:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

module.exports = router;