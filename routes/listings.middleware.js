// Middleware helpers for listings routes

export function parseIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  req.listingId = id;
  next();
}

export function makeLoadListing(listings) {
  return function loadListing(req, res, next) {
    const id = req.listingId;
    const listingIndex = listings.findIndex((l) => l.id === id);
    if (listingIndex === -1 || listingIndex > listings.length) {
      return res.status(404).json({ error: "Listing not found" });
    } else {
      req.listing = listings[listingIndex];
      req.listingIndex = listingIndex;
      next();
    }
  };
}

export function requireOwner(req, res, next) {
  //   const userId = req.user.sub;
  const userId = Number(req.user.sub);
  const listing = req.listing;
  if (userId !== listing.ownerId) {
    return res.status(403).json({ error: "Forbidden" });
  } else {
    next();
  }
}

export function validateListingBody(req, res, next) {
  const { title, price } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Invalid input" });
  }
  if (typeof price !== "number" || Number.isNaN(price)) {
    return res.status(400).json({ error: "Invalid input" });
  }
  next();
}

export function validateListingPatchBody(req, res, next) {
  const allowed = ["title", "price", "condition"];
  const keys = Object.keys(req.body);

  if (keys.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  for (const key of keys) {
    if (!allowed.includes(key)) {
      return res.status(400).json({ error: "Invalid field" });
    }
  }

  if ("title" in req.body && typeof req.body.title !== "string") {
    return res.status(400).json({ error: "Invalid title" });
  }

  if ("price" in req.body && typeof req.body.price !== "number") {
    return res.status(400).json({ error: "Invalid price" });
  }

  next();
}
