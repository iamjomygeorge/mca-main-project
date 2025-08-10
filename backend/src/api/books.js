const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/authenticateToken');
const { upload, uploadFileToS3 } = require('../services/fileUpload');

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  upload.fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'coverImageFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (req.user.role !== 'AUTHOR') {
        return res.status(403).json({ error: 'Forbidden: Only authors can upload books.' });
      }

      const { title, description } = req.body;
      const bookFile = req.files['bookFile'] ? req.files['bookFile'][0] : null;
      const coverImageFile = req.files['coverImageFile'] ? req.files['coverImageFile'][0] : null;

      if (!title || !bookFile) {
        return res.status(400).json({ error: 'Title and a book file are required.' });
      }

      const bookFileUrl = await uploadFileToS3(
        bookFile.buffer,
        bookFile.originalname,
        bookFile.mimetype,
        'books' // Specify the folder
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

      const authorId = req.user.userId;
      const newBook = await pool.query(
        'INSERT INTO books (author_id, title, description, book_file_url, cover_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [authorId, title, description, bookFileUrl, coverImageUrl]
      );

      res.status(201).json(newBook.rows[0]);

    } catch (err) {
      console.error('Book Upload Error:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

module.exports = router;