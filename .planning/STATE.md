# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** The ship database is always current with the latest Star Citizen ships and data without any manual maintenance.
**Current focus:** Phase 2 (Ship API Routes) -- in progress

## Current Position

Phase: 2 of 7 (Ship API Routes)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-03 -- Completed 02-01-PLAN.md (ship query functions & text index)

Progress: [█████░░░░░] ~21% (5 of ~24 total plans estimated)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: ~2.4 min
- Total execution time: ~12 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Sync Engine | 4 | ~10 min | ~2.5 min |
| 2 - Ship API Routes | 1 | ~2 min | ~2 min |

**Recent Trend:**
- Last 5 plans: 01-02 (~2 min), 01-03 (~2 min), 01-04 (~3 min), 02-01 (~2 min)
- Trend: stable, consistently fast

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 7-phase build order following sync -> API -> migration -> types -> UI -> integration -> cleanup dependency chain
- [Roadmap]: Phases 2 and 3 can parallelize (both depend only on Phase 1); Phases 5 and 6 can parallelize (both depend on Phase 2 + Phase 4)
- [01-01]: Zod schemas use .passthrough() for forward compatibility with FleetYards API changes
- [01-01]: Separate raw API types (fleetyards/types.ts) from Zod validation schemas (types/ship.ts) -- different purposes
- [01-01]: ShipDocument images flattened to 10 URL strings instead of nested view objects
- [01-03]: No local JSON fallback for ships -- cached reference data, unavailable if MongoDB is down
- [01-03]: bulkWrite with individual upsert fallback for Cosmos DB compatibility
- [01-03]: Unique indexes on fleetyardsId and slug enforce data integrity at DB level
- [01-04]: require() for node-cron instead of ESM import to avoid Next.js Edge bundling issues
- [01-04]: 80% count-drop threshold aborts sync to prevent data loss from partial API responses
- [01-04]: Overdue sync check on startup runs immediately if >24h since last sync
- [02-01]: Import Sort type from mongodb to avoid TypeScript union type error in conditional sort
- [02-01]: $regex fallback in findShips mitigates Cosmos DB text index compatibility concern
- [02-01]: warn-level logging on text index creation failure (not silently swallowed)

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Cosmos DB text search indexes may not be supported -- MITIGATED by $regex fallback in findShips (02-01)
- [Research]: FleetYards API rate limits undocumented -- monitor for 429 responses during Phase 1 sync testing
- [Research]: Ship name matching accuracy unknown until dry-run against production data -- critical for Phase 3
- [01-04]: Pre-existing build failure from discord.js/zlib-sync webpack issue in planned-missions route -- unrelated to ship sync but may affect Phase 2 build verification

## Session Continuity

Last session: 2026-02-03
Stopped at: Completed 02-01-PLAN.md. Ready for 02-02.
Resume file: .planning/phases/02-ship-api-routes/02-01-SUMMARY.md

IMPORTANT CONTEXT:
- commit_docs is true (commit planning artifacts)
- Model profile is "quality"
- The project uses Cosmos DB for MongoDB vCore (confirmed by research) which DOES support $text indexes
- Pre-existing build failure from discord.js/zlib-sync is unrelated -- use `npm run type-check` for verification instead of `npm run build`
