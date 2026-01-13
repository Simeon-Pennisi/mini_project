import { query } from "../db.js";

export async function getAllListings() {
  const result = await query(
    `SELECT id, title, price, condition, owner_id AS "ownerId", created_at AS "createdAt"
     FROM listings
     ORDER BY id`
  );
  return result.rows;
}

export async function getListingById(id) {
  const result = await query(
    `SELECT id, title, price, condition, owner_id AS "ownerId"
     FROM listings
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createListing({ title, price, condition, ownerId }) {
  const result = await query(
    `INSERT INTO listings (title, price, condition, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, price, condition, owner_id AS "ownerId"`,
    [title, price, condition ?? null, ownerId]
  );
  return result.rows[0];
}

// Returns updated row if updated, null if no row matched (either not found OR not owner)
export async function updateListing({ id, ownerId, title, price, condition }) {
  const result = await query(
    `UPDATE listings
     SET title = $1,
         price = $2,
         condition = COALESCE($3, condition),
         updated_at = NOW()
     WHERE id = $4 AND owner_id = $5
     RETURNING id, title, price, condition, owner_id AS "ownerId"`,
    [title, price, condition ?? null, id, ownerId]
  );
  return result.rows[0] ?? null;
}

// Returns true if deleted, false otherwise (either not found OR not owner)
export async function deleteListing({ id, ownerId }) {
  const result = await query(
    `DELETE FROM listings
     WHERE id = $1 AND owner_id = $2`,
    [id, ownerId]
  );
  return result.rowCount > 0;
}
