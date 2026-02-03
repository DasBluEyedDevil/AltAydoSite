# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** The ship database is always current with the latest Star Citizen ships and data without any manual maintenance.
**Current focus:** Phase 3 (Data Migration) -- Complete, verified against live data. Phase 4 (Type System Pivot) next.

## Current Position

Phase: 3 of 7 (Data Migration) -- COMPLETE
Plan: 2 of 2 in current phase
Status: Phase complete -- migration executed against production Cosmos DB
Last activity: 2026-02-03 -- Migration executed: 116 ship refs converted, 0 unmatched, 0 failed

Progress: [█████████░] ~38% (9 of ~24 total plans estimated)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: ~2.3 min
- Total execution time: ~21 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Sync Engine | 4 | ~10 min | ~2.5 min |
| 2 - Ship API Routes | 3 | ~5 min | ~1.7 min |
| 3 - Data Migration | 2 | ~5 min | ~2.6 min |

**Recent Trend:**
- Last 5 plans: 02-02 (~1 min), 02-03 (~2 min), 03-01 (~1.5 min), 03-02 (~3.7 min)
- Trend: stable, 03-02 slightly longer due to 765-line migration script with 5 collection handlers

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
- [02-02]: Zod with z.coerce for query param validation instead of manual parseInt
- [02-02]: public, max-age=300, stale-while-revalidate=60 for both ship endpoints
- [02-03]: POST instead of GET for batch endpoint (array of 50 UUIDs exceeds URL length limits)
- [02-03]: 1-hour cache on manufacturers (rarely changing), no-store on batch (POST)
- [02-03]: No pagination on manufacturers endpoint (~33 entries, bounded dataset)
- [03-01]: Five-pass matching strategy in strict priority order (manual-override, exact, case-insensitive, slug, contains)
- [03-01]: Override map values are slugs (human-readable, stable), resolved to UUID via index at runtime
- [03-01]: Contains match uses first-match semantics for deterministic behavior
- [03-01]: Import from @/lib/mongodb not mongodb-client (consistent with mission-storage pattern)
- [03-02]: Use user-storage API for users (handles MongoDB/local fallback), direct fs for operations/resources JSON
- [03-02]: Mutate JSON files in-place for operations/resources (small files, atomic read/write)
- [03-02]: Skip counting at ship/participant level for granular reporting accuracy

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Cosmos DB text search indexes may not be supported -- MITIGATED by $regex fallback in findShips (02-01)
- [Research]: FleetYards API rate limits undocumented -- monitor for 429 responses during Phase 1 sync testing
- [RESOLVED]: Ship name matching accuracy verified -- 116/116 references matched (100% match rate) against production data
- [01-04]: Pre-existing build failure from discord.js/zlib-sync webpack issue in planned-missions route -- unrelated to ship sync but may affect Phase 2 build verification
- [03-exec]: FleetYards API changed response format -- view fields now flat strings at top level, objects under media. Schema updated in 8a8b72a.
- [03-exec]: COSMOS_DATABASE_ID must be `aydocorp-database` (not `aydocorpdb-vcore`) -- actual app data lives there
- [03-exec]: Planned mission idempotency partial (3/4 re-updated on second run) -- fleetyardsId may not persist on MissionShip subdocuments. Phase 4 type updates should address.

## Session Continuity

Last session: 2026-02-03
Stopped at: Phase 3 fully executed and verified against production Cosmos DB. Phase 4 (Type System Pivot) next.
Resume file: .planning/ROADMAP.md (Phase 4)

IMPORTANT CONTEXT:
- commit_docs is true (commit planning artifacts)
- Model profile is "quality"
- The project uses Cosmos DB for MongoDB vCore (confirmed by research) which DOES support $text indexes
- Pre-existing build failure from discord.js/zlib-sync is unrelated -- use `npm run type-check` for verification instead of `npm run build`
