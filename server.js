import "dotenv/config";
import express from "express";
import router from "./routes/listings.js";
import authRouter from "./routes/auth.js";
import { query } from "./db.js";

const app = express();
app.use(express.json());

// console.log("DB URL:", process.env.DATABASE_URL);
console.log("DATABASE_URL loaded?", Boolean(process.env.DATABASE_URL));

app.use("/api", authRouter);

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

// DB check endpoint (for testing purposes)
// app.get("/api/dbcheck", async (req, res, next) => {
//   try {
//     const result = await query("SELECT NOW() as now");
//     res.json(result.rows[0]);
//   } catch (err) {
//     next(err);
//   }
// });

// app.get("/api/dbinfo", async (req, res, next) => {
//   try {
//     const r = await query(
//       "SELECT current_database() AS db, current_user AS user"
//     );
//     res.json(r.rows[0]);
//   } catch (err) {
//     next(err);
//   }
// });

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
