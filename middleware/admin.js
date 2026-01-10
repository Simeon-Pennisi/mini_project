import express from "express";

// require admin middleware
export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next(); // let the real route handler run
}

export default requireAdmin;
