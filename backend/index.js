const express = require('express');
const pool = require('./src/config/database');
const authenticationRoutes = require('./src/api/authentication');
const userRoutes = require('./src/api/userProfile.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use('/api/auth', authenticationRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Inkling Backend API!" });
});

// A special test route to verify the database connection.
app.get('/database-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json(result.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection error");
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});