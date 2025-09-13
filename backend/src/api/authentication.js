const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const {
  registrationRules,
  loginRules,
  validate,
} = require('../middleware/authValidator');

const router = express.Router();

const saltRounds = 10;

router.post('/register', registrationRules(), validate, async (req, res) => {
  try {
    const { fullName, email, password, username, role } = req.body;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userRole = role === 'AUTHOR' ? 'AUTHOR' : 'READER';

    const newUser = await pool.query(
      'INSERT INTO users (full_name, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, username, email, role, created_at',
      [fullName, username || null, email, passwordHash, userRole]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', loginRules(), validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;