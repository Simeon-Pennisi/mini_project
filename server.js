import express from "express";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
  console.log("Health check endpoint was called");
});

app.get("/version", (req, res) => {
  res.json({ service: "health-check", version: "1.0.0" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
