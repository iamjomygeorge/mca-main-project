require("dotenv").config();
const { Client } = require("pg");

const runReset = async () => {
  const sslConfig =
    process.env.PGSSLMODE === "no-verify"
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: true };

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
  });

  try {
    await client.connect();
    console.log("Deleting database schema...");

    await client.query("DROP SCHEMA public CASCADE;");

    await client.query("CREATE SCHEMA public;");

    await client.query("GRANT ALL ON SCHEMA public TO postgres;");
    await client.query("GRANT ALL ON SCHEMA public TO public;");

    console.log("Database is now empty and fresh.");
  } catch (err) {
    console.error("Error resetting database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runReset();
