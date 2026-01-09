// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import { query } from "../db.js";
import jwt from "jsonwebtoken";

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

router.post("/login", async (req, res, next) => {
  try {
    const emailRaw = req.body?.email;
    const password = req.body?.password;

    const email =
      typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

    // Validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (typeof password !== "string") {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Fetch user
    const result = await query(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      // Intentionally same response for "user not found" and "bad password"
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const token = jwt.sign(
      { sub: String(user.id), email: user.email },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
