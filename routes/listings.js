import express from "express";
const router = express.Router();
const listings = [
  // the following are mock data
  {
    id: 1,
    title: "Used MacBook Pro",
    price: 1200,
    condition: "Good",
    ownerId: "user-1",
  },
  {
    id: 2,
    title: "Mechanical Keyboard",
    price: 150,
    condition: "Like New",
    ownerId: "user-1",
  },
  {
    // test case for listing with different user id
    id: 3,
    title: "Power Bank",
    price: 15,
    condition: "Poor",
    ownerId: "user-2",
  },
];

// return all listings for all users
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
    const { id } = req.params;
    const { title, price, condition } = req.body;
    const userId = req.header("X-User-Id"); // Assuming X-User-Id is a header for user ID
    const created = { ...req.body, id: Date.now(), ownerId: userId };
    // listings.push(created);
    console.log("created listing:", created);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    } else if (
      !created.title ||
      created.price == null ||
      typeof created.price !== "number"
    ) {
      return res.status(400).json({ error: "Invalid input" });
    } else {
      listings.push(created);
      return res.status(201).json(created);
    }
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const listingIndex = listings.findIndex((l) => l.id === id);
    if (listingIndex === -1) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listing = listings[listingIndex];

    if (userId !== listing.ownerId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { title, price, condition } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Invalid input" });
    }
    if (typeof price !== "number" || Number.isNaN(price)) {
      return res.status(400).json({ error: "Invalid input" });
    }
    if (typeof condition !== "string" || condition.trim() === "") {
      return res.status(400).json({ error: "Invalid input" });
    }

    const updatedListing = { ...listing, title, price, condition };
    listings[listingIndex] = updatedListing;

    return res.status(200).json(updatedListing);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.header("X-User-Id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const listingIndex = listings.findIndex((l) => l.id === id);
    if (listingIndex === -1) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listing = listings[listingIndex];

    if (userId !== listing.ownerId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    listings.splice(listingIndex, 1);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
