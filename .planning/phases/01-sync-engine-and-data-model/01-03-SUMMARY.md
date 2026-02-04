---
phase: 01-sync-engine-and-data-model
plan: 03
subsystem: ship-storage
tags: [mongodb, cosmos-db, bulk-upsert, indexes, ship-sync, crud]
dependency-graph:
  requires:
    - 01-01 (ShipDocument and SyncStatusDocument types from src/types/ship.ts)
  provides:
    - MongoDB CRUD module for ships collection (upsertShips, getShipByFleetyardsId, getShipBySlug, getShipCount)
    - Append-only sync audit log (saveSyncStatus, getLatestSyncStatus)
    - Ships and sync-status collection indexes with unique constraints
  affects:
    - 01-04 (Sync orchestrator will call upsertShips, saveSyncStatus, getShipCount, getLatestSyncStatus)
    - 02-xx (API routes will call getShipByFleetyardsId, getShipBySlug)
tech-stack:
  added: []
  patterns:
    - bulkWrite with ordered:false for throughput, individual upsert fallback for Cosmos DB compatibility
    - $setOnInsert for createdAt preserves first-insert timestamp on upsert
    - Append-only audit log (insertOne, never updateOne on sync-status)
    - No local JSON fallback for reference data collections
key-files:
  created:
    - src/lib/ship-storage.ts
  modified:
    - src/lib/mongo-indexes.ts
decisions:
  - "No local JSON fallback for ships -- unlike users, ships are cached reference data from external API. If MongoDB is down, ships are unavailable."
  - "bulkWrite fallback to individual upserts -- Cosmos DB may not support all bulkWrite options; individual upserts provide per-document error isolation"
  - "Unique indexes on fleetyardsId and slug enforce data integrity at the database level"
  - "No text indexes created -- Cosmos DB compatibility concern documented in RESEARCH.md"
metrics:
  duration: "~2 minutes"
  completed: "2026-02-03"
---

# Phase 1 Plan 3: Ship Storage & MongoDB Indexes Summary

**One-liner:** MongoDB CRUD module with bulk upsert (bulkWrite + individual fallback), ship queries by UUID/slug, append-only sync audit log, and unique indexes on fleetyardsId/slug.

## What Was Done

### Task 1: Create ship-storage.ts with upsert and query functions
- Created `src/lib/ship-storage.ts` (233 lines) with 6 exported functions
- `upsertShips`: bulkWrite with ordered:false, $setOnInsert for createdAt, fallback to individual updateOne on bulkWrite failure
- `getShipCount`: countDocuments for pre/post-sync sanity checks
- `getShipByFleetyardsId`: findOne lookup by FleetYards UUID
- `getShipBySlug`: findOne lookup by URL-friendly slug
- `saveSyncStatus`: insertOne append-only audit record
- `getLatestSyncStatus`: findOne with sort by lastSyncAt descending
- All functions use connectToDatabase from mongodb-client.ts, no ensureConnection calls
- Error handling: try/catch with console.error logging; re-throw for upsertShips, return null/0 for reads
- **Commit:** `d03bf76`

### Task 2: Extend mongo-indexes.ts with ships and sync-status indexes
- Added ships collection indexes: unique on fleetyardsId, unique on slug, field indexes on manufacturer.code, productionStatus, syncVersion, compound on manufacturer.code+size
- Added sync-status collection index: compound on type+lastSyncAt for latest sync lookup
- Followed existing pattern: try/catch wrapper, .catch(() => {}) on each createIndex, Promise.all
- No existing index blocks modified
- No text indexes created (Cosmos DB safety)
- **Commit:** `6ce10e9`

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| `npm run type-check` | Zero errors |
| ship-storage.ts exports upsertShips | Confirmed |
| ship-storage.ts exports getShipCount | Confirmed |
| ship-storage.ts exports getShipByFleetyardsId | Confirmed |
| ship-storage.ts exports getShipBySlug | Confirmed |
| ship-storage.ts exports saveSyncStatus | Confirmed |
| ship-storage.ts exports getLatestSyncStatus | Confirmed |
| mongo-indexes.ts has ships collection block | Confirmed |
| mongo-indexes.ts has sync-status collection block | Confirmed |
| No text indexes in mongo-indexes.ts | Confirmed (0 matches for 'text') |
| No local JSON fallback in ship-storage.ts | Confirmed |
| upsertShips uses bulkWrite ordered:false | Confirmed |
| $setOnInsert for createdAt in both paths | Confirmed (bulkWrite + individual fallback) |

## Key Design Decisions

1. **No local JSON fallback:** Ships are cached reference data from the FleetYards API. If MongoDB is unavailable, ship data is simply not accessible -- there is no local truth to fall back to. This is intentionally different from user-storage.ts.

2. **Dual upsert strategy:** bulkWrite with ordered:false for maximum throughput on standard MongoDB, with automatic fallback to individual updateOne calls if bulkWrite fails (Cosmos DB compatibility). The fallback provides per-document error isolation so one bad ship does not block the rest.

3. **$setOnInsert for createdAt:** The createdAt timestamp is only set on first insert and never overwritten on subsequent upserts. This preserves the original discovery date of each ship in the database.

4. **Append-only sync audit log:** saveSyncStatus uses insertOne, creating a new document per sync run. No sync records are ever updated or deleted, providing a complete audit trail.

5. **Unique indexes on fleetyardsId and slug:** These enforce data integrity at the database level, preventing duplicate ships even if the application logic has a bug.

## Next Phase Readiness

Plan 01-04 (Sync Orchestrator) can proceed immediately. It will:
- Import `upsertShips` to persist transformed ships to MongoDB
- Import `saveSyncStatus` to record each sync run's results
- Import `getShipCount` for pre/post-sync sanity checking
- Import `getLatestSyncStatus` to determine the next sync version number
- Indexes will be created automatically when `ensureMongoIndexes` runs on connection

No blockers identified for downstream plans.
