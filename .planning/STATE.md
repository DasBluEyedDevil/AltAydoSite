# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** The ship database is always current with the latest Star Citizen ships and data without any manual maintenance.
**Current focus:** Phase 7 in progress -- cleanup and decommissioning of legacy ship system.

## Current Position

Phase: 7 of 7 (Cleanup & Decommission)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-04 -- Completed 07-01-PLAN.md (legacy import cleanup)

Progress: [████████████████████████] ~96% (24 of ~25 total plans estimated)

## Performance Metrics

**Velocity:**
- Total plans completed: 24
- Average duration: ~2.5 min
- Total execution time: ~61 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Sync Engine | 4 | ~10 min | ~2.5 min |
| 2 - Ship API Routes | 3 | ~5 min | ~1.7 min |
| 3 - Data Migration | 2 | ~5 min | ~2.6 min |
| 4 - Type System | 2 | ~5 min | ~2.5 min |
| 5 - Ship Browse UI | 5 | ~11 min | ~2.2 min |
| 5.1 - Ship Browse Gaps | 2 | ~4 min | ~2 min |
| 6 - Frontend Integration | 5 | ~15 min | ~3 min |
| 7 - Cleanup & Decommission | 1 | ~5 min | ~5 min |

**Recent Trend:**
- Last 5 plans: 06-03 (~2 min), 06-04 (~4 min), 06-05 (~3 min), 07-01 (~5 min)
- Trend: slightly longer for cleanup (more verification overhead, cross-file grepping)

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
- [04-01]: image made optional (not removed) to avoid breaking ~7 components -- deferred removal to Phase 7
- [04-01]: shipDetailsToMissionShip sets fleetyardsId to '' with caller-must-set comment
- [04-01]: Downstream type errors fixed inline (profile Zod schema, fleet builder, mission planner image fallbacks)
- [04-02]: resolveShipImage fallback chain: requested view -> angled -> store -> placeholder
- [04-02]: Legacy function renamed to resolveShipImageLegacy (not overloaded) for clean separation
- [04-02]: Profile route fleetyardsId validated as UUID (stricter than plain string from 04-01)
- [05-01]: Cache-Control 60s+30s stale for sync-status (shorter than ship data 300s because it shows recency)
- [05-01]: No error state exposed from useSyncStatus (freshness is non-critical UI)
- [05-01]: AbortController in all hooks to prevent race conditions on filter/param changes
- [05-01]: ShipQueryResult defined locally in useShips (avoids server module import in client code)
- [05-02]: Image error handled via React state (useState + onError) rather than CSS-only fallback
- [05-02]: 24 skeleton placeholders matching default pageSize for consistent loading UX
- [05-02]: Manufacturer column hidden on small screens in list view (sm:block) to prevent overflow
- [05-03]: Debounce via native setTimeout (no lodash) -- 300ms delay sufficient for search
- [05-03]: Manufacturer filter sends slug as value (not display name) per API contract
- [05-03]: External value sync in ShipSearchBar uses ref flag to prevent debounce re-trigger
- [05-03]: formatClassification local helper in FilterPanel (underscore-split title case)
- [05-04]: ShipImageGallery/ShipSpecs pre-existed from 05-02 -- no duplicate creation needed
- [05-04]: Body scroll lock when detail panel is open (overflow hidden on body)
- [05-04]: Production status badge uses inline style for dynamic CSS variable color mapping (Tailwind can't compose variable names)
- [05-04]: Description collapse state resets on shipId change (each new ship starts with specs visible)
- [05-05]: useReducer for centralized filter state management (avoids stale closures from research pitfall #2)
- [05-05]: SET_FILTER and SET_SEARCH both reset page to 1 (changing filters returns to first page)
- [05-05]: ShipBrowsePage owns ALL state and passes it down to child components
- [05-05]: SyncStatusIndicator is self-contained (uses useSyncStatus hook internally, renders nothing on error)
- [05-05]: FleetDatabaseClient is a thin 'use client' wrapper for the server-rendered page.tsx
- [05.1-01]: logo field is string | null (not optional) -- null means no logo, not 'unknown'
- [05.1-01]: FleetYardsShipSchema uses .nullable().optional().default(null) for backward compat with existing data
- [05.1-02]: Logo sizes: 16px grid cards, 14px list rows, 20px detail panel -- proportional to context
- [05.1-02]: List spec columns responsive: crew at md+, cargo/speed at lg+ to prevent overflow
- [05.1-02]: ManufacturerOption logo field added for type correctness only -- native select cannot render images
- [06-01]: ids.join(',') as useEffect dependency for stable array comparison in useShipBatch
- [06-01]: Sequential chunk fetching (not parallel) to avoid overwhelming the API
- [06-01]: FleetAggregation types defined locally in useOrgFleet.ts (co-located with the only consumer)
- [06-01]: USER_PAGE_SIZE set to 200 (maximum allowed by /api/users endpoint)
- [06-01]: Classification uses classificationLabel (human-readable) not classification key for aggregation display
- [06-02]: FleetShipPickerModal uses pageSize 12 (smaller grid than browse page's 24 to fit modal viewport)
- [06-02]: Modal state resets on close via RESET action (clean filter state each time modal opens)
- [06-02]: Angled view image preferred for fleet display (larger cards benefit from angled perspective)
- [06-02]: Unresolved ships show "No image available" placeholder div instead of placeholder image
- [06-03]: Map<fleetyardsId, ShipDocument> for pending selections (preserves full ship data for onSelectShips callback)
- [06-03]: Dense list rows in modal (not full cards) for efficient multi-selection scanning
- [06-03]: Replace "Est. Crew" with "Ships: N" (crew data requires static DB lookup, now removed)
- [06-03]: Image fallback to /assets/ship-placeholder.png (Phase 4 placeholder, not legacy /images/placeholder-ship.png)
- [06-04]: Profile fleet is read-only (no add/remove on profile page, fleet management in fleet builder edit mode)
- [06-04]: Unresolved mission participant ships show name/role text only, no image or placeholder
- [06-04]: INT-05 contextual specs: crew for multi-crew ships (crew.max > 1), cargo for transport/freight/hauling
- [06-05]: Recharts PieLabelRenderProps has optional fields -- label function uses defaults instead of strict typing
- [06-05]: Bar chart uses per-bar Cell coloring matching pie chart palette for visual consistency
- [06-05]: Tab indicator uses framer-motion layoutId for smooth animated underline
- [07-01]: getShipPlaceholder returns empty string -- components handle empty/falsy URLs via CSS empty states
- [07-01]: getTotalShips replaces getEstimatedCrew -- crew data unavailable without static DB, count ships instead
- [07-01]: ShipImage.tsx updated to CSS empty state since resolveShipImageLegacy was removed (deviation Rule 3)

### Roadmap Evolution

- Phase 5.1 inserted after Phase 5: Fix verification gaps (UI-04 manufacturer logos, UI-05 card specs) -- NOW COMPLETE

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Cosmos DB text search indexes may not be supported -- MITIGATED by $regex fallback in findShips (02-01)
- [Research]: FleetYards API rate limits undocumented -- monitor for 429 responses during Phase 1 sync testing
- [RESOLVED]: Ship name matching accuracy verified -- 116/116 references matched (100% match rate) against production data
- [01-04]: Pre-existing build failure from discord.js/zlib-sync webpack issue in planned-missions route -- unrelated to ship sync but may affect Phase 2 build verification
- [03-exec]: FleetYards API changed response format -- view fields now flat strings at top level, objects under media. Schema updated in 8a8b72a.
- [03-exec]: COSMOS_DATABASE_ID must be `aydocorp-database` (not `aydocorpdb-vcore`) -- actual app data lives there
- [RESOLVED]: Planned mission idempotency partial -- Phase 4 type updates now include fleetyardsId in MissionShip type, addressing the persistence concern from 03-exec.
- [RESOLVED]: UserFleetBuilder now uses FleetShipPickerModal with real fleetyardsId from ship API (06-02)
- [RESOLVED]: /images/placeholder-ship.png fallback in MissionPlannerForm replaced with /assets/ship-placeholder.png (06-03)
- [RESOLVED]: UI-04 gap -- manufacturer logo URLs captured in data model (05.1-01) and rendered in UI (05.1-02). Gap closed.
- [RESOLVED]: UI-05 gap -- ship specs (crew, cargo, speed) now displayed on ShipCard and ShipCardList using format utilities (05.1-02). Gap closed.
- [RESOLVED]: postcss.config.js was missing from project root (moved to scripts/ in Dec 2025 refactor). Restored in 4900314.
- [RESOLVED]: All placeholder PNG references eliminated from live source files (07-01). CSS-only empty states used instead.

## Session Continuity

Last session: 2026-02-04
Stopped at: Completed 07-01-PLAN.md. Phase 7 plan 1/3 complete. Next: 07-02 (legacy file deletion).
Resume file: None

IMPORTANT CONTEXT:
- commit_docs is true (commit planning artifacts)
- Model profile is "quality"
- The project uses Cosmos DB for MongoDB vCore (confirmed by research) which DOES support $text indexes
- Pre-existing build failure from discord.js/zlib-sync is unrelated -- use `npm run type-check` for verification instead of `npm run build`
- next.config.js now exists at project root (restored from scripts/) with FleetYards CDN support
- postcss.config.js now exists at project root (restored from scripts/) -- required for Tailwind CSS processing
- Image from next/image is imported in ShipCard.tsx, ShipCardList.tsx, and ShipDetailPanel.tsx
- Legacy fleet-ops/mission-planner components still reference ShipData.ts but are scheduled for deletion in Plan 02
