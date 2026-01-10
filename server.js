import "dotenv/config";
import express from "express";
import router from "./routes/listings.js";
import authRouter from "./routes/auth.js";
import { query } from "./db.js";
import adminRouter from "./routes/admin.js";

const app = express();
app.use(express.json());

// console.log("DB URL:", process.env.DATABASE_URL);
console.log("DATABASE_URL loaded?", Boolean(process.env.DATABASE_URL));

app.use("/api", authRouter);
app.use("/api", adminRouter);
app.use("/api/listings", router);

console.log("BOOTED SERVER: auth enabled");

// production logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} (${
        Date.now() - start
      }ms)`
    );
  });
  next();
});

app.use("/api/listings", router);

// Error handling middleware
app.use((err, req, res, next) => {
  // If error comes from JSON parsing (entity.parse.failed) → 400
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON payload" });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
  console.log(err);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Health service running on port ${PORT}`);
});
