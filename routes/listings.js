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

// functions for middleware
// set req.userId
function requireUser(req, res, next) {
  const userId = req.header("X-User-Id"); // Assuming X-User-Id is a header for user ID
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  } else {
    req.userId = userId;
    next();
  }
}
// set req.listingId
function parseIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  req.listingId = id;
  next();
}
// set req.listing + req.listingIndex
function loadListing(req, res, next) {
  const id = req.listingId;
  const listingIndex = listings.findIndex((l) => l.id === id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  } else {
    req.listing = listings[listingIndex];
    req.listingIndex = listingIndex;
    next();
  }
}
// compare req.userId vs req.listing.ownerId
function requireOwner(req, res, next) {
  const userId = req.userId;
  const listing = req.listing;
  if (userId !== listing.ownerId) {
    return res.status(403).json({ error: "Forbidden" });
  } else {
    next();
  }
}
// validate req.body
function validateListingBody(req, res, next) {
  const { title, price } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Invalid input" });
  }
  if (typeof price !== "number" || Number.isNaN(price)) {
    return res.status(400).json({ error: "Invalid input" });
  }
  next();
}

// routes
router.get("/", async (req, res, next) => {
  try {
    console.log("listings:", listings);
    res.status(200).json([...listings]);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireUser, validateListingBody, async (req, res, next) => {
  try {
    const { title, price, condition } = req.body;
    const created = { ...req.body, id: Date.now(), ownerId: req.userId };
    if (
      // !created.title ||
      // created.price == null ||
      // typeof created.price !== "number"
      !validateListingBody(req, res, next)
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

router.put(
  "/:id",
  requireUser, // Assuming requireUser middleware is defined elsewhere
  parseIdParam, // Assuming parseIdParam middleware is defined elsewhere
  loadListing, // Assuming loadListing middleware is defined elsewhere
  requireOwner, // Assuming requireOwner middleware is defined elsewhere
  validateListingBody,
  async (req, res, next) => {
    try {
      const { title, price, condition } = req.body;
      const updatedListing = {
        ...req.listing,
        title,
        price,
        condition: condition ?? req.listing.condition,
      };
      listings[req.listingIndex] = updatedListing;

      return res.status(200).json(updatedListing);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id",
  requireUser,
  parseIdParam,
  loadListing,
  requireOwner,
  async (req, res, next) => {
    try {
      const { listingIndex } = req; // Assuming req.listingIndex is set by loadListing middleware
      listings.splice(listingIndex, 1);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
