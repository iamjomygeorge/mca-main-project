const { Pool } = require("pg");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const isProduction = process.env.NODE_ENV === "production";

const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
};

const pool = new Pool(connectionConfig);

pool.on("error", (err, client) => {
  console.error(
    "Unexpected error on idle client (likely Supabase idle timeout)",
    err
  );
});

module.exports = pool;
