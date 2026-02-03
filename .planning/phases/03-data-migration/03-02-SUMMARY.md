---
phase: 03-data-migration
plan: 02
subsystem: data-migration
tags: [migration, ships, fleetyards, uuid, cosmos-db, mongodb]
depends_on:
  requires: ["03-01"]
  provides: ["migrate-ships script", "ship reference migration for all 5 collections"]
  affects: ["04-type-pivot"]
tech-stack:
  added: []
  patterns: ["multi-collection migration", "idempotent migration", "dry-run mode", "structured migration report"]
key-files:
  created:
    - src/scripts/migrate-ship-references.ts
  modified:
    - package.json
decisions:
  - id: "03-02-01"
    decision: "Use user-storage API for users (handles MongoDB/local fallback) and direct fs for operations/resources JSON files"
    rationale: "Consistent with existing storage patterns -- user-storage handles the MongoDB vs local fallback automatically"
  - id: "03-02-02"
    decision: "Mutate operations/resources JSON in-place (read, modify, write back) rather than per-document DB updates"
    rationale: "Local JSON files are small and read/written atomically -- no need for individual document updates"
  - id: "03-02-03"
    decision: "Skip counting for idempotency increments skipped counter at ship/participant level, not document level"
    rationale: "More accurate reporting -- a document with 3 ships where 2 are already migrated shows 2 skipped + 1 updated"
metrics:
  duration: "3.7 min"
  completed: "2026-02-03"
---

# Phase 3 Plan 02: Migration Script Summary

Ship reference migration script converting all ship names across 5 entity types to FleetYards UUIDs via multi-pass name matching from Plan 01's resolveShipName engine.

## What Was Built

Created `src/scripts/migrate-ship-references.ts` (765 lines) -- a comprehensive migration script that converts ship name strings to FleetYards UUIDs across all five collections in the system:

1. **Users** (`migrateUserShips`) -- Iterates `user.ships[]`, resolves each `ship.name` via `resolveShipName()`, adds `fleetyardsId` field. Uses `user-storage.ts` API (handles MongoDB/local fallback automatically).

2. **Missions** (`migrateMissions`) -- Iterates `mission.participants[]`, resolves `participant.shipName`, adds `fleetyardsId`. Uses `connectToDatabase()` from `mongodb.ts`.

3. **Planned Missions** (`migratePlannedMissions`) -- Iterates `plannedMission.ships[]` (MissionShip), resolves `ship.shipName`, adds `fleetyardsId`. Uses `connectToDatabase()`.

4. **Operations** (`migrateOperations`) -- Reads `data/operations.json`, iterates `operation.participants[]`, resolves `participant.shipName`, adds `fleetyardsId`. Uses direct `fs` for read/write.

5. **Resources** (`migrateResources`) -- Reads `data/resources.json`, filters to `type === 'Ship'`, resolves `resource.name`, adds `fleetyardsId`. Uses direct `fs` for read/write.

### Key Features

- **Dry-run mode:** `npm run migrate-ships -- --dry-run` logs all planned changes without writing
- **Idempotency:** Checks `UUID_REGEX.test(fleetyardsId)` before processing -- skips already-migrated documents
- **Non-destructive:** Only ADDS `fleetyardsId` field -- never removes existing fields (name, shipName, manufacturer, image, etc.)
- **Comprehensive report:** Prints structured report with per-collection stats, all name mappings with match strategies, and unmatched names
- **Exit codes:** Exit 0 if all names matched, exit 1 if any unmatched names remain

### npm Script

```json
"migrate-ships": "tsx src/scripts/migrate-ship-references.ts"
```

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 03-02-01 | Use user-storage API for users, direct fs for operations/resources | Consistent with existing patterns; user-storage handles fallback |
| 03-02-02 | Mutate JSON files in-place for operations/resources | Small files, atomic read/write, simpler than per-document updates |
| 03-02-03 | Skip counting at ship/participant level not document level | More accurate granular reporting |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript cast error on UserShip to Record<string, unknown>**

- **Found during:** Task 1
- **Issue:** `Conversion of type 'UserShip' to type 'Record<string, unknown>' may be a mistake` -- TypeScript rejects direct cast from a typed interface to Record
- **Fix:** Changed cast to `as any` with eslint-disable comment for the idempotency check
- **Files modified:** `src/scripts/migrate-ship-references.ts`
- **Commit:** 41cffca

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 41cffca | feat | Create migration script scaffolding with users, missions, planned-missions handlers |
| 7288785 | feat | Implement operations, resources handlers and printReport |
| e55e1e2 | chore | Add migrate-ships npm script |

## Success Criteria Verification

| ID | Criteria | Status |
|----|----------|--------|
| MIG-01 | User ship references get fleetyardsId via migrateUserShips | PASS |
| MIG-02 | Mission participant ship references via migrateMissions and migratePlannedMissions | PASS |
| MIG-03 | Operation participant ship references via migrateOperations | PASS |
| MIG-04 | Resource records of type Ship via migrateResources | PASS |
| MIG-05 | Multi-pass name matching via resolveShipName from Plan 01 | PASS |
| MIG-06 | Idempotent -- UUID_REGEX.test(fleetyardsId) check skips already-migrated | PASS |
| - | Migration report printed with all mappings and strategies | PASS |
| - | npm run migrate-ships and --dry-run are valid commands | PASS |

## Next Phase Readiness

Phase 3 (Data Migration) is now complete. Both plans delivered:
- **03-01:** Ship name matching engine (`ship-name-matcher.ts`)
- **03-02:** Migration script (`migrate-ship-references.ts` + npm script)

The migration script is ready to run against production data. Recommend running `npm run migrate-ships -- --dry-run` first to review mappings before live execution.

Phase 4 (Type System Pivot) can proceed -- it depends on the `fleetyardsId` field being present on all ship references, which this migration provides.
