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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { fullName, email, password, username, role } = req.body;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userRole = role === 'AUTHOR' ? 'AUTHOR' : 'READER';

    const newUserRes = await client.query(
      'INSERT INTO users (full_name, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fullName, username || null, email, passwordHash, userRole]
    );
    const newUser = newUserRes.rows[0];

    if (newUser.role === 'AUTHOR') {
      await client.query(
        'INSERT INTO authors (name, user_id) VALUES ($1, $2)',
        [newUser.username, newUser.id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(newUser);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Registration Error:', err.message);
    if (err.code === '23505') {
        return res.status(400).json({ error: 'An account with this email or username already exists.' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
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
  } catch (err)
 {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;