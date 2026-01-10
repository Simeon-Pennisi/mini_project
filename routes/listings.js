import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const listings = [
  // the following are mock data
  {
    id: 1,
    title: "Used MacBook Pro",
    price: 1200,
    condition: "Good",
    ownerId: "1",
  },
  {
    id: 2,
    title: "Mechanical Keyboard",
    price: 150,
    condition: "Like New",
    ownerId: "1",
  },
  {
    // test case for listing with different user id
    id: 3,
    title: "Power Bank",
    price: 15,
    condition: "Poor",
    ownerId: "2",
  },
];

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
  const userId = req.user.sub;
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

// GET api/admin/ping route for testing admin auth
// router.get("/admin/ping", requireAuth, requireAdmin, (req, res) => {
//   return res.status(200).json({ message: "admin role confirmed" });
// });

router.post("/", requireAuth, validateListingBody, async (req, res, next) => {
  try {
    const { title, price, condition } = req.body;

    const created = {
      id: Date.now(),
      title,
      price,
      condition,
      ownerId: req.user.sub,
    };

    listings.push(created);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  requireAuth,
  parseIdParam,
  loadListing,
  requireAdmin,
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
  requireAuth,
  parseIdParam,
  loadListing,
  requireOwner,
  async (req, res, next) => {
    try {
      listings.splice(req.listingIndex, 1);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
