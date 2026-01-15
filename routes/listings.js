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
import {
  getAllListings,
  getListingById,
  updateListing,
} from "./listings.repo.js";

const router = express.Router();

// routes
// get all listings
router.get("/", async (req, res, next) => {
  try {
    const listings = await getAllListings();
    if (!listings) return res.status(404).json({ error: "Listing not found" });

    console.log("listings:", listings);
    res.status(200).json([...listings]);
  } catch (err) {
    next(err);
  }
});

// create a listing with next available id
router.post(
  "/",
  requireAuth,
  parseIdParam,
  validateListingBody,
  async (req, res, next) => {
    try {
      const id = req.listingId;
      // const userId = req.user.sub;
      const userId = Number(req.user.sub);
      const existing = await getListingById(id);
      if (existing)
        return res
          .status(409)
          .json({ error: "Listing with this ID already exists" });
      const { title, price, condition } = req.body;
      const created = {
        id,
        title,
        price,
        condition,
        ownerId: userId,
      };
      listings.push(created);
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

// create a new listing
router.put(
  "/:id",
  requireAuth,
  parseIdParam,
  validateListingBody,
  async (req, res, next) => {
    try {
      const id = req.listingId;
      // const userId = req.user.sub;
      const userId = Number(req.user.sub);

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

router.delete(
  "/:id",
  requireAuth,
  parseIdParam,
  makeLoadListing(),
  requireOwner,
  async (req, res, next) => {
    try {
      const id = req.listingId;
      // const userId = req.user.sub;
      const userId = Number(req.user.sub);

      const existing = await getListingById(id);
      if (!existing)
        return res.status(404).json({ error: "Listing not found" });
      if (existing.ownerId !== userId)
        return res.status(403).json({ error: "Forbidden" });

      await deleteListing(id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
