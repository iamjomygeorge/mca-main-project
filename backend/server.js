const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const logger = require("./src/config/logger");
const pinoHttp = require("pino-http")({ logger });

const validateEnvironment = require("./src/config/env.validation");
validateEnvironment();

const pool = require("./src/config/database");
const webhookRoutes = require("./src/api/webhooks");
const apiRoutes = require("./src/api");

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
        ],
        scriptSrc: ["'self'"],
      },
    },
  })
);

app.use(compression());
app.use(pinoHttp);

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

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (err) {
    req.log.error(err, "Health check failed");
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Inkling Backend API!" });
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  req.log.error(err);
  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  logger.info(`Backend server is running on http://localhost:${PORT}`);
});

const shutdown = async () => {
  logger.info("SIGTERM/SIGINT received: closing HTTP server");
  server.close(async () => {
    logger.info("HTTP server closed");
    await pool.end();
    logger.info("Database pool closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
