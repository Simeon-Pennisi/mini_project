import express from "express";
// import listingsRouter from "./routes/listings.js";
import router from "./routes/listings.js";

const app = express();
app.use(express.json());
app.use("/api/listings", router); // changed from listingsRouter to router
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Health service running on port ${PORT}`);
});
