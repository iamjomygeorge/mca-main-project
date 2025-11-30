const { Pool } = require("pg");

const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false";

const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: rejectUnauthorized,
  },
};

const pool = new Pool(connectionConfig);

pool.on("error", (err, client) => {
  if (err.message && err.message.includes("db_termination")) {
    console.warn(
      "Database idle connection closed by server. Pool will reconnect automatically."
    );
    return;
  }
  console.error("Unexpected error on idle client", err);
});

module.exports = pool;
