---
phase: 01-sync-engine-and-data-model
plan: 01
subsystem: data-model
tags: [typescript, zod, types, fleetyards-api, node-cron, mongodb]
dependency-graph:
  requires: []
  provides:
    - ShipDocument interface for MongoDB ships collection
    - SyncStatusDocument interface for sync audit logs
    - FleetYardsShipResponse interface for API client code
    - FleetYardsShipSchema Zod runtime validation
    - ShipDocumentSchema Zod internal validation
    - node-cron dependency for scheduled sync
  affects:
    - 01-02 (FleetYards API client uses FleetYardsShipResponse types)
    - 01-03 (Transform layer maps ValidatedFleetYardsShip to ShipDocument)
    - 01-04 (Sync orchestrator uses SyncStatusDocument and node-cron)
tech-stack:
  added:
    - node-cron@^4.2.1 (cron scheduling)
    - "@types/node-cron@^3.0.11" (TypeScript definitions)
  patterns:
    - Zod schemas as trust boundary between external API and internal pipeline
    - Separate raw API types from internal storage types
    - passthrough() for forward compatibility with API changes
key-files:
  created:
    - src/types/ship.ts
    - src/lib/fleetyards/types.ts
  modified:
    - package.json
    - package-lock.json
    - .env.example
decisions:
  - "Zod schema uses .passthrough() to allow unknown fields through -- prevents breakage when FleetYards adds new response fields"
  - "manufacturer.longName dropped from ShipDocument -- only name, code, slug stored internally to reduce document size"
  - "crew.minLabel and crew.maxLabel dropped from ShipDocument -- labels can be derived at display time"
  - "Image URLs flattened in ShipDocument with separate medium-resolution fields for responsive UI usage"
  - "ShipDocumentSchema added as secondary validation layer for internal document consistency"
metrics:
  duration: "~3 minutes"
  completed: "2026-02-03"
---

# Phase 1 Plan 1: Types, Schemas & Dependencies Summary

**JWT auth with refresh rotation using jose library -- WRONG TEMPLATE**

**One-liner:** FleetYards API types, MongoDB ShipDocument interface, Zod validation schemas, and node-cron dependency for the ship sync pipeline.

## What Was Done

### Task 1: Install node-cron and update .env.example
- Installed `node-cron@^4.2.1` as runtime dependency
- Installed `@types/node-cron@^3.0.11` as dev dependency
- Appended `SHIP_SYNC_CRON_SCHEDULE` and `SHIP_SYNC_ENABLED` to `.env.example`
- Verified node-cron is importable at runtime
- **Commit:** `87a5feb`

### Task 2: Create FleetYards API response types
- Created `src/lib/fleetyards/types.ts` with three exported interfaces
- `FleetYardsImageView`: multi-resolution image URLs (source, small, medium, large)
- `FleetYardsManufacturer`: manufacturer details (name, longName, slug, code)
- `FleetYardsShipResponse`: full 35-field ship object matching live API response
- All fields documented with JSDoc comments
- **Commit:** `80cbaf0`

### Task 3: Create ShipDocument types and Zod validation schemas
- Created `src/types/ship.ts` with internal types and validation
- `ShipDocument`: 25-field MongoDB document with flattened images, simplified manufacturer, sync metadata
- `SyncStatusDocument`: audit log with counts (new/updated/unchanged/skipped), duration, errors
- `FleetYardsShipSchema`: Zod schema validating required fields (id, name, slug, manufacturer) with all others nullable/optional and `.passthrough()`
- `ShipDocumentSchema`: secondary Zod schema for internal document validation
- `ValidatedFleetYardsShip`: inferred type from Zod validation
- Verified Zod validates sample ship object correctly
- **Commit:** `ba5174a`

## Deviations from Plan

### Auto-added Functionality

**1. [Rule 2 - Missing Critical] Added ShipDocumentSchema Zod validation**
- **Found during:** Task 3
- **Issue:** Plan specified FleetYardsShipSchema for API boundary validation but did not include a schema for validating ShipDocument before database insertion. Without this, malformed documents could enter MongoDB.
- **Fix:** Added `ShipDocumentSchema` as a secondary validation layer for internal document consistency
- **Files modified:** `src/types/ship.ts`
- **Commit:** `ba5174a`

## Verification Results

| Check | Result |
|-------|--------|
| `npm run type-check` | Zero errors |
| `node -e "require('node-cron')"` | Exits cleanly |
| ship.ts exports ShipDocument | Confirmed |
| ship.ts exports SyncStatusDocument | Confirmed |
| ship.ts exports FleetYardsShipSchema | Confirmed |
| ship.ts exports ValidatedFleetYardsShip | Confirmed |
| fleetyards/types.ts exports FleetYardsShipResponse | Confirmed |
| fleetyards/types.ts exports FleetYardsImageView | Confirmed |
| fleetyards/types.ts exports FleetYardsManufacturer | Confirmed |
| .env.example has SHIP_SYNC vars | Confirmed |
| Zod validates sample ship | Confirmed |

## Key Design Decisions

1. **Separate API types from Zod schemas:** `FleetYardsShipResponse` in `fleetyards/types.ts` gives compile-time type safety for API client code, while `FleetYardsShipSchema` in `ship.ts` provides runtime validation at the trust boundary. They are intentionally not imported from each other.

2. **Zod .passthrough():** Allows unknown fields through so that when FleetYards adds new response fields, our sync pipeline does not break.

3. **Defaults on optional fields:** Non-critical fields in the Zod schema use `.optional().default(...)` to ensure the transform layer always receives predictable types even when the API omits fields.

4. **Images flattened:** ShipDocument stores 10 pre-extracted image URL strings instead of nested view objects, making frontend consumption simpler and database queries on images possible.

## Next Phase Readiness

Plan 01-02 (FleetYards API Client) can proceed immediately. It will:
- Import `FleetYardsShipResponse` from `src/lib/fleetyards/types.ts` for typing API responses
- Import `FleetYardsShipSchema` from `src/types/ship.ts` for validating each ship before transform
- Use `ValidatedFleetYardsShip` as the output type from the validation step

No blockers identified for downstream plans.
