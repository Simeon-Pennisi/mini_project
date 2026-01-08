// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import { query } from "../db.js";

const router = express.Router();

function isValidEmail(email) {
  // Practical baseline (not perfect, but acceptable for now)
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/register", async (req, res, next) => {
  try {
    const emailRaw = req.body?.email;
    const password = req.body?.password;

    const email =
      typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

    // Validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const cost = Number(process.env.BCRYPT_COST) || 10;
    const passwordHash = await bcrypt.hash(password, cost);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, passwordHash]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    // Postgres unique violation
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    return next(err);
  }
});

export default router;
