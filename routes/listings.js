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

router.get("/", (req, res) => {
  res.status(200).json([...listings]);
});

router.post("/", (req, res) => {
  const created = listings.push({ ...req.body, id: Date.now() });
  //   const created = [...listings, { ...req.body, id: Date.now() }];
  console.log("created listing:", created);
  res.status(201).send(created);
});

export default router;
