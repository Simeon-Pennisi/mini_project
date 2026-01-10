import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { query } from "../db.js";

const router = express.Router();

router.get("/admin/ping", requireAuth, requireAdmin, (req, res) => {
  res.json({ message: "admin role confirmed" });
});

router.get(
  "/admin/users",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const result = await query(
        "SELECT id, email, role, created_at FROM users ORDER BY id"
      );
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
