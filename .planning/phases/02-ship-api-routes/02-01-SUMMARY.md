# Phase 2 Plan 1: Ship Query Functions & Text Index Summary

**One-liner:** Four MongoDB query functions (findShips, getShipByIdOrSlug, getShipsByFleetyardsIds, getManufacturers) with weighted text search index and $regex fallback

---

## Metadata

- **Phase:** 02-ship-api-routes
- **Plan:** 01
- **Subsystem:** data-access
- **Tags:** mongodb, text-search, pagination, aggregation, query-functions
- **Duration:** ~2 min
- **Completed:** 2026-02-03

### Dependency Graph

- **Requires:** Phase 1 (ship-storage.ts CRUD, ShipDocument type, mongo-indexes.ts)
- **Provides:** Query functions for Phase 2 API route handlers (Plans 02 and 03)
- **Affects:** 02-02 (ship list/search endpoint), 02-03 (ship detail/manufacturers endpoints)

### Tech Tracking

- **tech-stack.added:** None (uses existing mongodb driver)
- **tech-stack.patterns:** $text search with $regex fallback, MongoDB aggregation pipeline for manufacturers, Sort type import from mongodb

### Key Files

- **Modified:** `src/lib/ship-storage.ts`, `src/lib/mongo-indexes.ts`
- **Created:** None

---

## What Was Done

### Task 1: Add query functions to ship-storage.ts (9a31c29)

Added four new exported functions and three new interfaces to `ship-storage.ts`:

**Interfaces:**
- `ShipQueryOptions` -- page, pageSize, manufacturer, size, classification, productionStatus, search
- `ShipQueryResult` -- items, total, page, pageSize, totalPages
- `ManufacturerInfo` -- name, code, slug, shipCount

**Functions:**
1. `findShips(options)` -- Paginated search with field filters pushed to MongoDB. Uses `$text` index for search relevance ranking, with automatic fallback to `$regex` on name if the text index is unavailable. Runs `find()` and `countDocuments()` in parallel.
2. `getShipByIdOrSlug(idOrSlug)` -- Dispatches to `getShipByFleetyardsId` or `getShipBySlug` based on UUID v4 pattern match.
3. `getShipsByFleetyardsIds(ids)` -- Batch lookup using `$in` operator for single round-trip resolution of multiple ships.
4. `getManufacturers()` -- MongoDB aggregation pipeline with `$group`, `$sort`, `$project` to return distinct manufacturers with ship counts.

All functions follow existing code style: JSDoc comments, `[ship-storage]` log prefix, try/catch with console.error.

### Task 2: Add text index to mongo-indexes.ts (9f55fad)

Added three new indexes to the ships collection block:

1. **Text search index:** `{ name: 'text', 'manufacturer.name': 'text' }` with weights `{ name: 10, 'manufacturer.name': 5 }`, named `ships_text_search`. Uses `.catch(err => console.warn(...))` for visible failure logging.
2. **Classification index:** `{ classification: 1 }` -- standalone filter for findShips.
3. **Size index:** `{ size: 1 }` -- standalone filter for findShips.

---

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Import `Sort` type from mongodb | Avoids TypeScript union type error when conditionally selecting text-score vs alphabetical sort |
| UUID_REGEX at module level | Reusable constant, avoids regex recompilation on each call to getShipByIdOrSlug |
| $regex fallback in findShips | Resilience against text index creation failure (Cosmos DB compatibility concern from STATE.md) |
| warn-level logging for text index | Critical index -- silent `.catch(() => {})` would mask failures causing hard-to-debug runtime errors |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript Sort type error**

- **Found during:** Task 1
- **Issue:** Conditional expression `search ? { score: { $meta: 'textScore' } } : { name: 1 }` produced a union type incompatible with mongodb's `Sort` parameter. The `as const` approach created `{ score: ...; name?: undefined }` which failed the Sort index signature.
- **Fix:** Imported `Sort` type from mongodb and explicitly typed the sort variable as `Sort`.
- **Files modified:** `src/lib/ship-storage.ts` (import line + sort declaration)
- **Commit:** 9a31c29

---

## Verification Results

- TypeScript compilation: PASS (no errors)
- All four new functions exported: PASS
- All existing functions preserved: PASS (upsertShips, getShipCount, getShipByFleetyardsId, getShipBySlug, saveSyncStatus, getLatestSyncStatus)
- Text index with weights and warn-level logging: PASS
- Classification and size standalone indexes: PASS

---

## Next Phase Readiness

Plans 02-02 and 02-03 can now import and use the query functions. The `findShips` function handles the /api/ships list+search endpoint, `getShipByIdOrSlug` handles detail, `getShipsByFleetyardsIds` handles batch resolution, and `getManufacturers` handles the manufacturer filter dropdown.

No blockers. The Cosmos DB text index concern from STATE.md is mitigated by the $regex fallback in findShips.
