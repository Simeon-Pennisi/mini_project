import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import {
  parseIdParam,
  makeLoadListing,
  requireOwner,
  validateListingBody,
} from "./listings.middleware.js";

const router = express.Router();

// const listings = [
//   // the following are mock data
//   {
//     id: 1,
//     title: "Used MacBook Pro",
//     price: 1200,
//     condition: "Good",
//     ownerId: "1",

//   "/:id",
//   requireAuth,
//   parseIdParam,
//   makeLoadListing(listings),
//   requireAdmin,
//   validateListingBody,
//   },
//   {
//     // test case for listing with different user id
//     id: 3,
//     title: "Power Bank",
//     price: 15,
//     condition: "Poor",
//     ownerId: "2",
//   },
// ];

const listings = [
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
  { id: 3, title: "Power Bank", price: 15, condition: "Poor", ownerId: "2" },
];

const loadListing = makeLoadListing(listings);

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

// router.put(
//   "/:id",
//   requireAuth,
//   parseIdParam,
//   loadListing,
//   requireAdmin,
//   validateListingBody,
//   async (req, res, next) => {
//     try {
//       const { title, price, condition } = req.body;

//       const updatedListing = {
//         ...req.listing,
//         title,
//         price,
//         condition: condition ?? req.listing.condition,
//       };

//       listings[req.listingIndex] = updatedListing;

//       return res.status(200).json(updatedListing);
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// create a new listing
router.put(
  "/:id",
  requireAuth,
  parseIdParam,
  loadListing,
  requireOwner,
  validateListingBody,
  (req, res) => {
    const { title, price, condition } = req.body;

    const updated = {
      ...req.listing,
      title,
      price,
      condition: condition ?? req.listing.condition,
    };

    listings[req.listingIndex] = updated;
    res.json(updated);
  }
);

// router.delete(
//   "/:id",
//   requireAuth,
//   parseIdParam,
//   makeLoadListing(listings),
//   requireOwner,
//   async (req, res, next) => {
//     try {
//       listings.splice(req.listingIndex, 1);
//       return res.status(204).send();
//     } catch (err) {
//       next(err);
//     }
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
