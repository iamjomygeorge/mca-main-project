const { Pool } = require("pg");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: rejectUnauthorized,
  },
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
