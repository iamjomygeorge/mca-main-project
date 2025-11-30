const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const validateEnvironment = require("./src/config/env.validation");
validateEnvironment();

const pool = require("./src/config/database");
const webhookRoutes = require("./src/api/webhooks");
const apiRoutes = require("./src/api");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());

const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

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

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Inkling Backend API!" });
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

const server = app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

const shutdown = async () => {
  console.log("SIGTERM/SIGINT received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await pool.end();
    console.log("Database pool closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
