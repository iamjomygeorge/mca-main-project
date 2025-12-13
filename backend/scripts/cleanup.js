require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DB_SSL_REJECT_UNAUTHORIZED === "false"
      ? { rejectUnauthorized: false }
      : undefined,
});

async function cleanup() {
  const client = await pool.connect();
  try {
    console.log("Starting Cleanup Process...");
    console.log("Deleting all simulated data...");

    // Delete simulated users (Cascade will remove their purchases, reviews, and library entries)
    const userRes = await client.query(
      "DELETE FROM users WHERE is_simulated = true"
    );
    console.log(`Deleted ${userRes.rowCount} simulated users.`);

    // Delete simulated authors (Cascade will remove their books)
    const authorRes = await client.query(
      "DELETE FROM authors WHERE is_simulated = true"
    );
    console.log(`Deleted ${authorRes.rowCount} simulated authors.`);

    console.log("Cleanup Complete. Real data remains intact.");
  } catch (err) {
    console.error("Cleanup Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
