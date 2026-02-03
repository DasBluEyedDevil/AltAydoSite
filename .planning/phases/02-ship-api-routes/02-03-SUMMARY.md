# Phase 2 Plan 3: Batch Ship Resolution & Manufacturers List Routes Summary

**One-liner:** POST /api/ships/batch (Zod-validated UUID array, max 50) and GET /api/ships/manufacturers (aggregated list with 1-hour cache) -- both public, no auth

---

## Metadata

- **Phase:** 02-ship-api-routes
- **Plan:** 03
- **Subsystem:** ship-api
- **Tags:** next.js, api-routes, zod, batch-lookup, manufacturers

## Dependency Graph

- **Requires:** 02-01 (ship-storage query functions: getShipsByFleetyardsIds, getManufacturers)
- **Provides:** POST /api/ships/batch endpoint, GET /api/ships/manufacturers endpoint
- **Affects:** Phase 5 (fleet UI -- batch resolution for fleet displays), Phase 6 (mission UI -- batch resolution for mission rosters)

## Tech Stack

- **Added:** None (all dependencies already in project)
- **Patterns:** POST-for-batch-reads pattern (JSON body for array of IDs instead of query params), array-wrapper response ({ items: T[] }) for API consistency

## What Was Done

### Task 1: POST /api/ships/batch route (API-03)
- Created `src/app/api/ships/batch/route.ts`
- Zod schema validates request body: `{ ids: string[] }` where each id must be UUID v4, array must have 1-50 items
- Separate try/catch for JSON parsing (returns 400 "Invalid JSON body") vs validation errors (returns 400 with field-level details)
- Delegates to `shipStorage.getShipsByFleetyardsIds()` for MongoDB `$in` lookup
- Returns `{ items: ShipDocument[] }` with `Cache-Control: no-store`
- No authentication required

### Task 2: GET /api/ships/manufacturers route (API-04)
- Created `src/app/api/ships/manufacturers/route.ts`
- No input parameters needed -- returns full manufacturer list every time
- Delegates to `shipStorage.getManufacturers()` which runs MongoDB aggregation pipeline
- Returns `{ items: ManufacturerInfo[] }` (name, code, slug, shipCount) sorted alphabetically
- `Cache-Control: public, max-age=3600` (1-hour cache -- manufacturers change rarely)
- No authentication required

## Files

### Created
- `src/app/api/ships/batch/route.ts` -- POST handler with Zod validation (68 lines)
- `src/app/api/ships/manufacturers/route.ts` -- GET handler with cache headers (33 lines)

### Modified
None

## Decisions Made

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | POST instead of GET for batch endpoint | Array of up to 50 UUIDs would be awkward in query params and may exceed URL length limits |
| 2 | Separate try/catch for JSON parse vs Zod validation | Cleaner error messages: "Invalid JSON body" vs field-level validation details |
| 3 | No pagination on manufacturers endpoint | Bounded dataset (~33 manufacturers) -- always returns full list |
| 4 | 1-hour cache on manufacturers, no-store on batch | Manufacturers rarely change; batch is POST so caching is inappropriate |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Status |
|-------|--------|
| `npm run type-check` passes | PASS |
| batch/route.ts exports POST | PASS |
| manufacturers/route.ts exports GET | PASS |
| Batch validates UUID array (max 50) via Zod | PASS |
| Neither route imports auth modules | PASS |
| Manufacturers Cache-Control: public, max-age=3600 | PASS |
| Batch Cache-Control: no-store | PASS |

## Commits

| Hash | Message |
|------|---------|
| f2aeabc | feat(02-03): add POST /api/ships/batch route for bulk ship resolution |
| bad6227 | feat(02-03): add GET /api/ships/manufacturers route with 1-hour cache |

## Performance

- **Duration:** ~2 min
- **Completed:** 2026-02-03

## API Surface After This Plan

| Method | Route | Auth | Cache | Purpose |
|--------|-------|------|-------|---------|
| GET | /api/ships | No | 5 min | Paginated ship list with search/filter |
| GET | /api/ships/[id] | No | 5 min | Single ship by UUID or slug |
| POST | /api/ships/batch | No | no-store | Resolve multiple ships by UUID array |
| GET | /api/ships/manufacturers | No | 1 hour | All manufacturers with ship counts |
| GET | /api/ships/sync-status | No | 30 sec | Latest sync status |

## Phase 2 Completion Status

With this plan complete, all 3 plans in Phase 2 are done:
- 02-01: Ship query functions and text index (storage layer)
- 02-02: Ships list, detail, and sync-status routes (API-01, API-02, API-05)
- 02-03: Batch resolution and manufacturers routes (API-03, API-04)

Phase 2 is complete. All 5 ship API endpoints are implemented.
