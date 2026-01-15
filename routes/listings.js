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
  createListing,
  updateListing,
  deleteListing,
} from "./listings.repo.js";

const router = express.Router();

// routes
// get all listings
router.get("/", async (req, res, next) => {
  try {
    const listings = await getAllListings();
    if (!listings) return res.status(404).json({ error: "Listings not found" });

    console.log("listings:", listings);
    res.status(200).json([...listings]);
  } catch (err) {
    next(err);
  }
});

// create a listing with next available id
router.post("/", requireAuth, validateListingBody, async (req, res, next) => {
  try {
    const ownerId = Number(req.user.sub);
    const { title, price, condition } = req.body;

    const created = await createListing({
      title,
      price,
      condition,
      ownerId,
    });

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
      // const userId = req.user.sub;
      const ownerId = Number(req.user.sub);

      const existing = await getListingById(id);
      if (!existing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      if (Number(existing.ownerId) !== ownerId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { title, price, condition } = req.body;

      const updated = await updateListing({
        id,
        ownerId,
        title,
        price,
        condition,
      });

      if (!updated) {
        return res.status(500).json({ error: "Update failed" });
      }

      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", requireAuth, parseIdParam, async (req, res, next) => {
  try {
    const id = req.listingId;
    const ownerId = Number(req.user.sub);

    const existing = await getListingById(id);
    if (!existing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (Number(existing.ownerId) !== ownerId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const ok = await deleteListing({ id, ownerId });

    if (!ok) {
      return res.status(500).json({ error: "Delete failed" });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
// Note: deleteListing function should be imported from listings.repo.js
