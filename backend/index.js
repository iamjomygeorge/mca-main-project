const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const pool = require("./src/config/database");

const authenticationRoutes = require("./src/api/auth");
const userRoutes = require("./src/api/users");
const bookRoutes = require("./src/api/books");
const adminRoutes = require("./src/api/admin");
const authorRoutes = require("./src/api/author");
const webhookRoutes = require("./src/api/webhooks");
const purchaseRoutes = require("./src/api/purchases");
const contactRoutes = require("./src/api/contact");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(morgan("dev"));

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authenticationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Inkling Backend API!" });
});

app.get("/database-test", async (req, res, next) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    res.json(result.rows[0]);
    client.release();
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
