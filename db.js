// db.js
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
// DB URL: postgres://postgres:mF3Sp97V4eT2L1@localhost:5432/mini_project_db

export async function query(text, params) {
  return pool.query(text, params);
}
