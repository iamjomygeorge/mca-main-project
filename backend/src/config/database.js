const { Pool } = require("pg");
const logger = require("./logger");

const sslConfig =
  process.env.PGSSLMODE === "no-verify"
    ? { rejectUnauthorized: false }
    : { rejectUnauthorized: true };

const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
};

const pool = new Pool(connectionConfig);

pool.on("error", (err, client) => {
  if (err.message && err.message.includes("db_termination")) {
    logger.warn(
      "Database idle connection closed by server. Pool will reconnect automatically."
    );
    return;
  }
  logger.error(err, "Unexpected error on idle client");
});

module.exports = pool;
