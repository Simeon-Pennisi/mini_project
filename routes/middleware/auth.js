import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.header("Authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { sub, email, iat, exp, ... }
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
