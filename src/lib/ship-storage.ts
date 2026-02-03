/**
 * Ship Storage Module -- MongoDB CRUD for ships and sync-status collections
 *
 * Unlike user-storage.ts, this module does NOT provide a local JSON fallback.
 * Ships are cached reference data from the FleetYards API. If MongoDB is
 * unavailable, ship data is simply not accessible until the connection is
 * restored.
 *
 * Key design decisions:
 * - Upsert-never-delete pattern: ships are inserted or updated, never removed
 * - createdAt is set only on first insert via $setOnInsert
 * - Sync status is append-only (insertOne, never updateOne)
 * - bulkWrite with ordered:false for maximum throughput, with individual
 *   upsert fallback for Cosmos DB compatibility
 */

import { connectToDatabase } from '@/lib/mongodb-client';
import type { ShipDocument, SyncStatusDocument } from '@/types/ship';

const DATABASE_ID = process.env.COSMOS_DATABASE_ID || 'aydocorp-database';

/**
 * Get the ships collection from the database.
 */
async function getShipsCollection() {
  const { client } = await connectToDatabase();
  const db = client.db(DATABASE_ID);
  return db.collection('ships');
}

/**
 * Get the sync-status collection from the database.
 */
async function getSyncStatusCollection() {
  const { client } = await connectToDatabase();
  const db = client.db(DATABASE_ID);
  return db.collection('sync-status');
}

// ---------------------------------------------------------------------------
// Ship CRUD Operations
// ---------------------------------------------------------------------------

/**
 * Bulk upsert ships into the ships collection.
 *
 * Uses bulkWrite with ordered:false for maximum throughput. If bulkWrite
 * fails (e.g. Cosmos DB compatibility issue), falls back to individual
 * updateOne calls with per-document error handling.
 *
 * - New ships are inserted with createdAt set via $setOnInsert
 * - Existing ships are updated (createdAt is preserved)
 * - No ships are ever deleted
 */
export async function upsertShips(
  ships: Omit<ShipDocument, '_id' | 'createdAt'>[]
): Promise<{ newShips: number; updatedShips: number; unchangedShips: number }> {
  if (ships.length === 0) {
    return { newShips: 0, updatedShips: 0, unchangedShips: 0 };
  }

  console.log(`[ship-storage] Upserting ${ships.length} ships...`);

  const shipsCollection = await getShipsCollection();

  // Build bulkWrite operations
  const operations = ships.map((ship) => ({
    updateOne: {
      filter: { fleetyardsId: ship.fleetyardsId },
      update: {
        $set: { ...ship },
        $setOnInsert: { createdAt: new Date() },
      },
      upsert: true,
    },
  }));

  try {
    // Attempt bulkWrite for maximum throughput
    const result = await shipsCollection.bulkWrite(operations, { ordered: false });

    const newShips = result.upsertedCount;
    const updatedShips = result.modifiedCount;
    const unchangedShips = result.matchedCount - result.modifiedCount;

    console.log(
      `[ship-storage] Bulk upsert complete: ${newShips} new, ${updatedShips} updated, ${unchangedShips} unchanged`
    );

    return { newShips, updatedShips, unchangedShips };
  } catch (bulkError) {
    console.error(
      '[ship-storage] bulkWrite failed, falling back to individual upserts:',
      bulkError
    );

    // Fallback: individual upserts with per-document error handling
    let newShips = 0;
    let updatedShips = 0;
    let unchangedShips = 0;
    let errorCount = 0;

    for (const ship of ships) {
      try {
        const result = await shipsCollection.updateOne(
          { fleetyardsId: ship.fleetyardsId },
          {
            $set: { ...ship },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          newShips++;
        } else if (result.modifiedCount > 0) {
          updatedShips++;
        } else {
          unchangedShips++;
        }
      } catch (docError) {
        errorCount++;
        console.error(
          `[ship-storage] Error upserting ship ${ship.fleetyardsId} (${ship.name}):`,
          docError
        );
      }
    }

    if (errorCount > 0) {
      console.error(
        `[ship-storage] Individual upsert completed with ${errorCount} errors out of ${ships.length} ships`
      );
    }

    console.log(
      `[ship-storage] Individual upsert complete: ${newShips} new, ${updatedShips} updated, ${unchangedShips} unchanged`
    );

    return { newShips, updatedShips, unchangedShips };
  }
}

/**
 * Get the total number of ships in the collection.
 * Used for pre/post-sync sanity checks.
 */
export async function getShipCount(): Promise<number> {
  try {
    const shipsCollection = await getShipsCollection();
    return await shipsCollection.countDocuments({});
  } catch (error) {
    console.error('[ship-storage] Error in getShipCount:', error);
    return 0;
  }
}

/**
 * Find a ship by its FleetYards UUID.
 */
export async function getShipByFleetyardsId(
  fleetyardsId: string
): Promise<ShipDocument | null> {
  try {
    const shipsCollection = await getShipsCollection();
    const doc = await shipsCollection.findOne(
      { fleetyardsId },
      { projection: { _id: 0 } }
    );
    return doc as ShipDocument | null;
  } catch (error) {
    console.error('[ship-storage] Error in getShipByFleetyardsId:', error);
    return null;
  }
}

/**
 * Find a ship by its URL-friendly slug.
 */
export async function getShipBySlug(slug: string): Promise<ShipDocument | null> {
  try {
    const shipsCollection = await getShipsCollection();
    const doc = await shipsCollection.findOne(
      { slug },
      { projection: { _id: 0 } }
    );
    return doc as ShipDocument | null;
  } catch (error) {
    console.error('[ship-storage] Error in getShipBySlug:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sync Status Audit Log
// ---------------------------------------------------------------------------

/**
 * Save a sync status audit record. This is an append-only log --
 * each sync run creates a new document, never updates an existing one.
 */
export async function saveSyncStatus(
  status: Omit<SyncStatusDocument, '_id'>
): Promise<void> {
  try {
    const syncStatusCollection = await getSyncStatusCollection();
    await syncStatusCollection.insertOne(status);
    console.log(
      `[ship-storage] Sync status saved: ${status.status}, version ${status.syncVersion}`
    );
  } catch (error) {
    console.error('[ship-storage] Error in saveSyncStatus:', error);
    throw error;
  }
}

/**
 * Retrieve the most recent sync status record.
 * Returns null if no sync has ever been recorded.
 */
export async function getLatestSyncStatus(): Promise<SyncStatusDocument | null> {
  try {
    const syncStatusCollection = await getSyncStatusCollection();
    const doc = await syncStatusCollection.findOne(
      { type: 'ship-sync' },
      { sort: { lastSyncAt: -1 }, projection: { _id: 0 } }
    );
    return doc as SyncStatusDocument | null;
  } catch (error) {
    console.error('[ship-storage] Error in getLatestSyncStatus:', error);
    return null;
  }
}
