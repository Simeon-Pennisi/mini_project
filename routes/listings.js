import express from "express";
const router = express.Router();
const listings = [
  // the following are mock data
  {
    id: 1,
    title: "Used MacBook Pro",
    price: 1200,
    condition: "Good",
  },
  {
    id: 2,
    title: "Mechanical Keyboard",
    price: 150,
    condition: "Like New",
  },
];

router.get("/", async (req, res, next) => {
  try {
    console.log("listings:", listings);
    res.status(200).json([...listings]);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const created = { ...req.body, id: Date.now() };
    const newListings = [...listings, created];
    console.log("created listing:", created);
    if (
      !created.title ||
      created.price == null ||
      typeof created.price !== "number"
    ) {
      return res.status(400).json({ error: "Invalid input" });
    } else {
      return res.status(201).json(created);
      newListings;
    }
  } catch (err) {
    next(err);
  }
});

export default router;
