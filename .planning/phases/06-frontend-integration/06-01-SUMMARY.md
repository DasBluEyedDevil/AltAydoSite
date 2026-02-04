---
phase: 06-frontend-integration
plan: 01
subsystem: hooks-and-mappers
tags: [react-hooks, batch-api, fleet-aggregation, mappers, recharts]
completed: 2026-02-04
duration: ~2 min

dependency-graph:
  requires: [phase-02-ship-api, phase-04-type-system]
  provides: [useShipBatch-hook, useOrgFleet-hook, ship-document-mappers, recharts-dependency]
  affects: [06-02, 06-03, 06-04, 06-05]

tech-stack:
  added: [recharts@^3.7.0]
  patterns: [batch-chunking, abort-controller-cleanup, fleet-aggregation]

key-files:
  created:
    - src/hooks/useShipBatch.ts
    - src/hooks/useOrgFleet.ts
    - src/lib/ships/mappers.ts
  modified:
    - package.json
    - package-lock.json
---

# Phase 6 Plan 01: Foundation Hooks and Mapping Utilities Summary

Batch ship resolution hook, org fleet aggregation hook, and ShipDocument-to-domain-type mappers enabling all Phase 6 downstream plans.

## What Was Done

### Task 1: useShipBatch hook and mapping utilities (a14f9fa)

**useShipBatch hook** (`src/hooks/useShipBatch.ts`):
- Accepts an array of FleetYards UUIDs, returns a `Map<string, ShipDocument>`
- Deduplicates and filters empty strings before fetching
- Returns empty Map immediately when no valid IDs are provided (no fetch)
- Chunks requests into batches of 50 to respect the `/api/ships/batch` Zod validation limit
- Fetches each chunk sequentially via POST with AbortController for cleanup
- Uses `ids.join(',')` as useEffect dependency for stable comparison
- Handles AbortError silently (returns without state update)

**Mapping utilities** (`src/lib/ships/mappers.ts`):
- `shipDocumentToUserShip`: Converts ShipDocument to UserShip (manufacturer name, ship name, fleetyardsId, resolved store image)
- `shipDocumentToMissionShip`: Converts ShipDocument to MissionShip (ship name, manufacturer, size, classification role, fleetyardsId, store image, configurable quantity)
- Both mappers use `resolveShipImage(ship.images, 'store')` for consistent image resolution
- Addresses Pitfall 4 (UserShip type mismatch) and Pitfall 5 (empty fleetyardsId placeholder) from research

### Task 2: useOrgFleet hook and recharts installation (d370f43)

**recharts installation**: Added recharts ^3.7.0 to dependencies for Plan 05 fleet analytics charts.

**useOrgFleet hook** (`src/hooks/useOrgFleet.ts`):
- Fetches all org members via paginated GET `/api/users` (page size 200, iterates until all pages consumed)
- Collects all unique fleetyardsIds from all users' ships arrays
- Batch-resolves via POST `/api/ships/batch` (same chunking pattern as useShipBatch)
- Aggregates fleet data across three axes:
  - **byClassification**: Grouped by `classificationLabel` (or 'Unclassified')
  - **byManufacturer**: Grouped by `manufacturer.name`
  - **bySize**: Grouped by `size` (or 'Unknown')
- Each axis includes per-ship drill-down counts within categories
- All axes sorted by count descending
- Tracks total ships, total members, and individual ship model counts via `shipDetails` Map
- Uses AbortController for cleanup on unmount

## Decisions Made

- [06-01]: ids.join(',') as useEffect dependency for stable array comparison in useShipBatch
- [06-01]: Sequential chunk fetching (not parallel) to avoid overwhelming the API
- [06-01]: FleetAggregation types defined locally in useOrgFleet.ts (co-located with the only consumer)
- [06-01]: USER_PAGE_SIZE set to 200 (maximum allowed by /api/users endpoint)
- [06-01]: Classification uses classificationLabel (human-readable) not classification key for aggregation display

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `npm run type-check` passes with zero errors (run after each task and at final)
- `src/hooks/useShipBatch.ts` exists and exports `useShipBatch`
- `src/hooks/useOrgFleet.ts` exists and exports `useOrgFleet`, `FleetAggregation`, `CategoryCount`
- `src/lib/ships/mappers.ts` exists and exports `shipDocumentToUserShip`, `shipDocumentToMissionShip`
- `recharts` appears in package.json dependencies at ^3.7.0

## Next Phase Readiness

All three foundation modules are ready for Plans 02-05:
- **Plan 02** (UserFleetBuilder): Can use `useShipBatch` and `shipDocumentToUserShip`
- **Plan 03** (MissionPlanner): Can use `useShipBatch` and `shipDocumentToMissionShip`
- **Plan 04** (Fleet Operations): Can use `useShipBatch`
- **Plan 05** (Fleet Analytics): Can use `useOrgFleet` and `recharts`

No blockers for downstream plans.
