const express = require("express");
const cors = require("cors");
const pool = require("./src/config/database");
const authenticationRoutes = require("./src/api/authentication");
const userRoutes = require("./src/api/userProfile.js");
const bookRoutes = require("./src/api/books");
const adminRoutes = require("./src/api/admin");
const authorRoutes = require("./src/api/author");
const webhookRoutes = require("./src/api/webhooks");
const purchaseRoutes = require("./src/api/purchase");
const cookieParser = require('cookie-parser');

const app = express();

app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use("/api/webhooks", webhookRoutes);
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.use(cookieParser());
app.use("/api/auth", authenticationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/purchase", purchaseRoutes);

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

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});