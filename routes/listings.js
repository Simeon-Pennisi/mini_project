import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import {
  parseIdParam,
  makeLoadListing,
  requireOwner,
  validateListingBody,
} from "./listings.middleware.js";
// new import statements
import { getListingById, updateListing } from "./listings.repo.js";

const router = express.Router();

// const listings = [
//   {
//     id: 1,
//     title: "Used MacBook Pro",
//     price: 1200,
//     condition: "Good",
//     ownerId: "1",
//   },
//   {
//     id: 2,
//     title: "Mechanical Keyboard",
//     price: 150,
//     condition: "Like New",
//     ownerId: "1",
//   },
//   { id: 3, title: "Power Bank", price: 15, condition: "Poor", ownerId: "2" },
// ];

// const loadListing = makeLoadListing(listings);

// middleware now imported from ./listings.middleware.js

// routes
router.get("/", async (req, res, next) => {
  try {
    console.log("listings:", listings);
    res.status(200).json([...listings]);
  } catch (err) {
    next(err);
  }
});

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

// create a new listing
router.put(
  "/:id",
  requireAuth,
  parseIdParam,
  validateListingBody,
  async (req, res, next) => {
    try {
      const id = req.listingId;
      const userId = req.user.sub;

      const existing = await getListingById(id);
      if (!existing)
        return res.status(404).json({ error: "Listing not found" });
      if (existing.ownerId !== userId)
        return res.status(403).json({ error: "Forbidden" });

      const { title, price, condition } = req.body;

      const updated = await updateListing({
        id,
        ownerId: userId,
        title,
        price,
        condition,
      });
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// router.put(
//   "/:id",
//   requireAuth,
//   parseIdParam,
//   loadListing,
//   requireOwner,
//   validateListingBody,
//   (req, res) => {
//     const { title, price, condition } = req.body;

//     const updated = {
//       ...req.listing,
//       title,
//       price,
//       condition: condition ?? req.listing.condition,
//     };

//     listings[req.listingIndex] = updated;
//     res.json(updated);
//   }
// );

// delete a listing
router.delete(
  "/:id",
  requireAuth,
  parseIdParam,
  loadListing,
  requireOwner,
  (req, res) => {
    listings.splice(req.listingIndex, 1);
    res.status(204).send();
  }
);

export default router;
