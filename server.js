import express from "express";
import router from "./routes/listings.js";

const app = express();
app.use(express.json());

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
const PORT = process.env.PORT || 3001;

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal Server Error" });
  console.log(err);
});

app.listen(PORT, () => {
  console.log(`Health service running on port ${PORT}`);
});
