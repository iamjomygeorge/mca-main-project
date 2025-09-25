const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database");
const authenticationRoutes = require("./src/api/authentication");
const userRoutes = require("./src/api/userProfile.js");
const bookRoutes = require("./src/api/books");
const adminRoutes = require("./src/api/admin");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.use("/api/auth", authenticationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Inkling Backend API!" });
});

app.get("/database-test", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    res.json(result.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection error");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});