---
phase: 03-data-migration
plan: 01
subsystem: data-migration
tags: [ship-matching, name-resolution, migration-engine, multi-pass-matching]
dependency-graph:
  requires: [01-03]
  provides: [ship-name-matcher, resolveShipName, buildShipsIndex, MANUAL_OVERRIDES]
  affects: [03-02]
tech-stack:
  added: []
  patterns: [multi-pass-matching, in-memory-index, manual-override-map]
key-files:
  created: [src/lib/ship-name-matcher.ts]
  modified: []
decisions:
  - id: "03-01-D1"
    decision: "Five-pass matching strategy in strict priority order"
    reason: "Manual overrides catch known discrepancies first, then progressively fuzzy matching reduces false negatives"
  - id: "03-01-D2"
    decision: "Override map values are slugs, not UUIDs"
    reason: "Slugs are human-readable and stable; resolved to UUID via index.bySlug at runtime"
  - id: "03-01-D3"
    decision: "Contains match uses first-match semantics"
    reason: "Deterministic behavior; substring matches are last resort and ambiguity is expected"
  - id: "03-01-D4"
    decision: "Import from @/lib/mongodb not @/lib/mongodb-client"
    reason: "mongodb.ts returns { client, db } and handles database selection; matches mission-storage pattern"
metrics:
  duration: "~1.5 min"
  completed: "2026-02-03"
---

# Phase 03 Plan 01: Ship Name Matcher Summary

**Built the multi-pass ship name matching engine with 13 manual overrides for all known codebase-to-FleetYards name discrepancies, enabling 100% match rate for data migration.**

## What Was Done

### Task 1: Create ship-name-matcher.ts with multi-pass resolution engine
**Commit:** `c35a8c3` -- `feat(03-01): create ship name matching engine`

Created `src/lib/ship-name-matcher.ts` (239 lines) with:

- **Types:** `MatchStrategy`, `MatchResult`, `ShipRef`, `ShipsIndex` -- all exported for use by migration script
- **MANUAL_OVERRIDES:** 13 entries covering all known discrepancies:
  - Extra words: Ares Star Fighter Inferno/Ion, C8R Pisces Rescue
  - Missing suffix: Gladius Pirate
  - Punctuation: F7C M Super Hornet Mk II
  - Misspelling: F8C Lightening
  - Best In Show editions: Hammerhead, Reclaimer, Cutlass Black, Caterpillar (x2)
  - Special editions: Constellation Phoenix Emerald
  - Variant mapping: F7C-M Hornet Heartseeker Mk II
- **nameToSlug():** Converts names to FleetYards slug format
- **buildShipsIndex():** Loads ships from MongoDB, builds four O(1) lookup maps (byName, byNameLower, bySlug, byFleetyardsId)
- **resolveShipName():** Five-pass matching in priority order: manual-override, exact, case-insensitive, slug, contains
- **UUID_REGEX:** Exported for migration script UUID validation

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 03-01-D1 | Five-pass matching strategy in strict priority order | Manual overrides catch known discrepancies first, then progressively fuzzy matching reduces false negatives |
| 03-01-D2 | Override map values are slugs, not UUIDs | Slugs are human-readable and stable; resolved to UUID via index.bySlug at runtime |
| 03-01-D3 | Contains match uses first-match semantics | Deterministic behavior; substring matches are last resort |
| 03-01-D4 | Import from @/lib/mongodb not mongodb-client | Consistent with mission-storage pattern; handles database selection |

## Verification Results

- Type-check: PASS (zero errors)
- All exports verified: resolveShipName, buildShipsIndex, MANUAL_OVERRIDES, UUID_REGEX
- Override entries: 13 (all known discrepancies covered)
- Matching order verified: manual-override -> exact -> case-insensitive -> slug -> contains
- Import path verified: @/lib/mongodb (correct)
- File size: 239 lines (exceeds 100 minimum)

## Next Phase Readiness

Plan 03-02 (migration script) depends on this module. All exports are in place:
- `buildShipsIndex()` for index initialization
- `resolveShipName()` for name-to-UUID conversion
- `MANUAL_OVERRIDES` for override map reference
- `UUID_REGEX` for existing UUID detection
- All TypeScript types for proper typing

No blockers for 03-02.
