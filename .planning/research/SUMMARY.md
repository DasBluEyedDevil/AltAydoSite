# Project Research Summary

**Project:** AydoCorp Website - Dynamic Ship Database (FleetYards API Integration)
**Domain:** Third-party API data synchronization for Star Citizen org management tool
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

This milestone integrates the FleetYards community API to replace a static 200-ship JSON file with a dynamic, self-updating ship database for AydoCorp's org management platform. The recommended approach uses a periodic sync service (node-cron) running in Azure App Service's persistent Node.js process to fetch 500+ ships from FleetYards, validate with Zod, and upsert to MongoDB via bulkWrite. Ships are stored with FleetYards UUIDs as canonical identifiers and served through RESTful API routes with filtering, search, and pagination.

The critical risk is the big-bang migration from name-based ship references to UUID-based references across five MongoDB collections (users, missions, operations, planned-missions, escort-requests). Name-matching fuzzy logic with manual fallbacks is essential to prevent orphaned fleet data. Secondary risks include FleetYards CDN dependency for all ship images (no local fallback planned) and Cosmos DB MongoDB compatibility gaps that could silently break text search or bulk operations. Mitigation strategies include comprehensive name mapping tables pre-migration, storing original ship names for reference, and validating 100% match rate before cutover.

The architecture follows existing codebase patterns: storage modules per entity, cron routes with bearer auth, denormalized references with ID + display fields, and index-first schema design. The build sequence is strictly ordered by dependencies: foundation (sync + storage) -> API routes -> migration script -> type updates -> frontend component updates -> cleanup. No dual-format transition period means the migration is a single, carefully orchestrated cutover.

## Key Findings

### Recommended Stack

The project requires only two new dependencies: node-cron for scheduling and p-limit for API request concurrency control. Everything else uses existing infrastructure: native fetch for HTTP (no need for Axios server-side), Zod 3.x already installed for validation, MongoDB driver 6.x for database operations. The deployment target is Azure App Service with standalone Next.js output, ruling out Vercel-specific solutions like Vercel Cron Jobs.

**Core technologies:**
- **node-cron (^4.2.1)**: Periodic sync scheduler - runs in Next.js instrumentation hook, persists with Azure App Service "Always On," zero infrastructure overhead vs. Azure Functions or WebJobs
- **Native fetch (built-in)**: FleetYards API client - no additional bundle weight, simple REST API needs no Axios features, Next.js extends fetch with caching semantics
- **Zod 3.x (existing)**: API response validation - safeParse at trust boundary to skip malformed records without crashing sync, staying on v3 avoids breaking change migration
- **MongoDB bulkWrite (existing driver 6.x)**: Upsert pattern - updateOne with fleetyardsId match key and upsert:true, ordered:false for parallel execution and partial failure tolerance
- **FleetYards CDN (direct linking)**: Ship images - no mirroring to R2, Next.js Image handles optimization, requires adding cdn.fleetyards.net to remotePatterns

**What NOT to add:** Mongoose/Prisma (dual data access patterns), Vercel Cron (not on Vercel), external schedulers (node-cron sufficient), Zod 4 or MongoDB 7 upgrades (separate migration tasks unrelated to this feature).

### Expected Features

The feature landscape divides into table stakes (features users expect from any Star Citizen ship database), differentiators (features specific to org management tools), and anti-features (scope traps to avoid). The current implementation is sparse: static JSON, single image per ship, manufacturer dropdown only, no detail views.

**Must have (table stakes):**
- T7: Data sync from FleetYards API - the entire point of this milestone, all else depends on this
- T8: Graceful degradation / offline fallback - extends existing hybrid storage pattern to ship data
- T1: Multi-axis search and filter - manufacturer + size + role + status + text search (current code only has manufacturer + text)
- T2: Ship detail card/panel - FleetYards, RSI Ship Matrix, and every community tool shows full specs on click
- T3: Multiple ship image views - angledView, sideView, topView, storeImage in multiple resolutions (currently single angle only)
- T6: Production status indicator - Flight Ready vs In Concept critical for mission planning accuracy
- T5: Ship specs display - length/beam/height, crew min/max, cargo SCU, SCM speed are "baseball card stats" users compare constantly

**Should have (competitive):**
- D2: Mission-aware ship selection - existing MissionComposer integration point, enhance with richer ship data showing cargo for haul missions, weapons for combat
- D1: Org fleet composition dashboard - aggregate user ships from profiles, show role breakdown with charts
- D4: Data freshness indicators - "Last synced: 2 hours ago" builds trust, uses FleetYards lastUpdatedAt field
- D5: Image gallery with view switcher - thumbnail strip, click to enlarge, angle selector aligns with MobiGlas aesthetic
- D9: Loaner ship awareness - FleetYards loaners array shows what players actually fly when concept ships assigned to missions

**Defer (v2+):**
- D3: Ship comparison side-by-side - medium-high complexity, FleetYards has this, nice-to-have not essential
- D6-D8: Smart suggestions, gap analysis, manufacturer pages - require D1/D2 maturity first
- A1-A9: Full loadout builder, 3D viewer, trade calculator, CCU optimizer, price tracking - massive scope creep, other tools do these extremely well, link out instead

### Architecture Approach

The architecture follows a sync-to-database-then-serve pattern with six primary components: Sync Service fetches paginated FleetYards data and transforms to internal schema, Ship Storage provides CRUD for the ships collection, Cron Route triggers sync on schedule, Ship API Routes serve filtered/paginated ship lists to frontend, Migration Script converts name-based references to UUIDs one-time, and Image Resolution maps ship documents to FleetYards CDN URLs. The data flow separates write path (periodic sync upsert) from read path (API routes from MongoDB cache).

**Major components:**
1. **Sync Service (src/lib/ship-sync.ts)** - Fetches all ships from FleetYards API with pagination, validates with Zod schemas, transforms nested objects to flat internal structure, bulk upserts to MongoDB by fleetyardsId, tracks syncVersion for staleness detection, logs to sync-status collection
2. **Ship Storage (src/lib/ship-storage.ts)** - MongoDB CRUD following existing *-storage.ts pattern, indexes on fleetyardsId (unique), slug (unique), name+manufacturer (text search), manufacturer+size (filter combo), syncVersion (housekeeping)
3. **Cron Route (/api/cron/ship-sync)** - Protected by CRON_SECRET bearer token, mirrors existing discord-sync route, triggers Sync Service, returns result with counts and errors, called by external scheduler or Azure Timer Function
4. **Ship API Routes** - GET /api/ships with filters/search/pagination, GET /api/ships/[id] by UUID or slug, GET /api/ships/batch for multi-ship resolution, GET /api/ships/manufacturers for faceted filtering
5. **Migration Script (src/scripts/migrate-ship-refs.ts)** - Builds lookup map from ship names to fleetyardsIds using fuzzy matching, updates users.ships[], planned-missions.ships[], missions.participants[], operations.participants[], stores original names, requires 100% match rate, writes rollback file
6. **Image Resolution (src/lib/ships/image.ts)** - Resolves ship document images object to specific view (store/angled/side/top) with resolution fallbacks, replaces old R2 CDN name-based convention, returns placeholder on null ship

**Key patterns:** Denormalize for display (store fleetyardsId + name + manufacturer in references, avoid JOIN queries), bulk operations (bulkWrite for sync, batch API for multi-ship fetches), upsert-never-delete (stale ships marked by syncVersion, not removed), syncVersion tracking (detect which ships disappeared from API without breaking references), index-first design (7 indexes covering all query patterns before queries written).

### Critical Pitfalls

The research identified 12 pitfalls across critical/moderate/minor severity. The top risks are migration data corruption, CDN dependency, and sync reliability.

1. **Name-matching migration produces orphaned references** - Ship names between current JSON and FleetYards don't align exactly (manufacturer prefixes, special characters, variant naming changes). Prevention: multi-pass fuzzy matching (exact, case-insensitive, with/without manufacturer, Levenshtein), manual mapping table for known discrepancies, 100% match requirement before proceeding, store original name alongside UUID as shipNameLegacy, verify post-migration that every reference still resolves.

2. **Big-bang migration corrupts production with no rollback** - Cross-collection updates can't be transactional on Cosmos DB (5-second timeout, no cross-collection transactions). Partial failure leaves mixed format. Prevention: point-in-time backup verified restorable, per-collection progress tracking with resume capability, schema version field on documents, rollback script built before migration script, read-only mode during migration, dry-run on staging data clone first.

3. **FleetYards CDN outage breaks all ship images site-wide** - No local fallback planned, community API has no SLA. Prevention: proxy/cache layer storing CDN URLs but serving from R2/blob with TTL (if within scope), or at minimum comprehensive onError placeholder handling per ship size category, store URLs in database not constructed client-side so CDN structure changes only affect sync not clients, health check monitoring CDN availability.

4. **Sync job silently overwrites good data with malformed API response** - FleetYards schema evolves without versioned contracts, empty page returns could be misinterpreted as "delete all". Prevention: never replace-all (upsert only, mark stale not delete), validate total count against expected range (400-700 ships, abort if <80% of previous), schema validation requiring non-null id/name/manufacturer before writing, keep previous syncVersion data until new validated, store raw response hash for debugging.

5. **Cosmos DB MongoDB compatibility gaps break operations** - Text search indexes not supported, bulkWrite behavior differs under partitioning, retryWrites already disabled. Prevention: test every query against Cosmos DB specifically not local MongoDB, simple indexes only (no text, <8 compound keys), application-level filtering on cached dataset for ship search (small enough to cache in-memory), individual upserts with per-document error handling instead of bulk if needed, verify indexes exist before sync, monitor RU consumption.

## Implications for Roadmap

Based on research, the build order is strictly sequenced by dependencies. Each phase must complete before the next can begin. The migration is the critical gate: it runs after sync infrastructure works but before any code expecting UUIDs deploys.

### Phase 1: Foundation & Sync Infrastructure
**Rationale:** Isolated infrastructure with no modifications to existing code. Can be built and tested independently by running sync and inspecting MongoDB. Establishes the data source everything else depends on.

**Delivers:**
- ShipDocument TypeScript types and database schema
- ship-storage.ts MongoDB CRUD module with 7 indexes
- ship-sync.ts sync service with FleetYards API client, pagination, validation, transformation
- /api/cron/ship-sync route protected by CRON_SECRET
- Ships collection populated with 500+ ships from FleetYards
- Sync-status audit collection tracking sync history

**Addresses:**
- T7 (API sync) - core infrastructure
- T8 foundation (storage layer for offline fallback)
- STACK.md recommendations (node-cron, native fetch, Zod validation, bulkWrite pattern)

**Avoids:**
- Pitfall 4 (malformed API response) - validation at trust boundary, count checking
- Pitfall 5 (Cosmos DB compatibility) - index-first design, tested against Cosmos specifically
- Pitfall 6 (schema drift) - explicit mapper function with field defaults

**Dependencies:** None. Purely additive.

### Phase 2: Ship API Routes
**Rationale:** API routes depend on ship-storage from Phase 1 but still don't modify existing code. Can be tested with Postman/curl before any UI changes. Establishes the read path for frontend consumption.

**Delivers:**
- GET /api/ships with manufacturer/size/status/role/search filters and pagination
- GET /api/ships/[id] single ship by UUID or slug
- GET /api/ships/batch multi-ship resolution by IDs
- GET /api/ships/manufacturers faceted filter list
- Response types (ShipResponse, pagination metadata)

**Addresses:**
- T1 (multi-axis filter) - backend implementation
- T2 foundation (ship detail endpoint)
- API contract for frontend components

**Implements:**
- Ship API Routes component from architecture
- Read path separate from sync write path

**Avoids:**
- Pitfall 11 (memory pressure) - lean projections for list views, full specs only for detail

**Dependencies:** Phase 1 (ship-storage, ships collection must exist)

### Phase 3: Migration Script & Data Cutover
**Rationale:** Migration requires populated ships collection to build lookup map (Phase 1). Must run BEFORE Phase 4 deploys code expecting fleetyardsId. This is the critical gate - the point of no return.

**Delivers:**
- Name-to-UUID lookup map with fuzzy matching
- Migration of users.ships[] to add fleetyardsId, remove image
- Migration of planned-missions.ships[] to add fleetyardsId
- Migration of missions.participants[] shipName references
- Migration of operations.participants[] shipName references
- Dry-run mode, rollback file, migration report
- 100% match rate verification

**Addresses:**
- Big-bang migration requirement from architecture
- Converting 5 collections to UUID references

**Avoids:**
- Pitfall 1 (orphaned references) - multi-pass fuzzy matching, 100% match requirement, manual override map
- Pitfall 2 (corruption with no rollback) - backup verification, per-collection progress, rollback script, read-only mode, staging dry-run
- Pitfall 10 (image URL staleness) - migrate image fields alongside ship references

**Dependencies:** Phase 1 (ships collection populated)

**WARNING:** Production outage window required. Put app in maintenance mode during execution.

### Phase 4: Type Updates & Image Resolution
**Rationale:** Type changes are the code-level pivot point. After this, all code expects UUIDs in ship references. Data must already be migrated (Phase 3) before these types deploy.

**Delivers:**
- UserShip type: add fleetyardsId, remove image field
- MissionShip type: add fleetyardsId
- MissionParticipant, OperationParticipant types: add fleetyardsId
- Updated resolveShipImage() taking ship document instead of name
- next.config.js remotePatterns for cdn.fleetyards.net
- API validation schemas (Zod) updated for new UserShip shape

**Addresses:**
- Type safety for UUID references
- T3 foundation (multiple image view support in types)
- Image CDN switch

**Implements:**
- Image Resolution component from architecture

**Avoids:**
- Pitfall 3 (CDN outage) - next.config.js remotePatterns added, onError handling prepared
- Pitfall 9 (missing remotePatterns) - prerequisite for image work

**Dependencies:** Phase 3 (data migrated to new shape)

### Phase 5: Frontend Component Updates
**Rationale:** Frontend consumes both API routes (Phase 2) and updated types (Phase 4). This is where users see the new functionality.

**Delivers:**
- UserFleetBuilder.tsx using /api/ships instead of getShipsByManufacturer()
- Mission planner ship picker with enhanced search/filter
- MissionDetail.tsx resolving images from ship documents
- OperationDetailView.tsx resolving images from ship documents
- UserProfileContent.tsx displaying FleetYards ship images
- Multi-angle image display (store/angled/side/top views)

**Addresses:**
- T1 (multi-axis filter) - frontend UI
- T2 (ship detail card) - clickable detail panels
- T3 (multiple image views) - UI for angle switching
- T4 (manufacturer logos) - enhanced dropdown
- T5 (ship specs) - display all fields
- T6 (production status) - flight-ready indicators
- T9 (role display) - classification labels
- D2 (mission-aware selection) - richer ship data in MissionComposer

**Avoids:**
- Pitfall 8 (search regression) - preserve manufacturer dropdown UX, add autocomplete with aliases

**Dependencies:** Phase 2 (API routes), Phase 4 (updated types)

### Phase 6: Polish & Differentiators
**Rationale:** Core functionality working, now add org-specific features that distinguish AydoCorp from generic ship browsers.

**Delivers:**
- D1: Org fleet composition dashboard (aggregate user ships, role breakdown charts)
- D4: Data freshness indicators ("Last synced: 2 hours ago")
- D5: Image gallery with smooth view switcher (thumbnail strip, Framer Motion transitions)
- Sync frequency configuration (daily via external cron service)
- Sync audit logging and monitoring

**Addresses:**
- Differentiator features from FEATURES.md
- Operational monitoring

**Dependencies:** Phase 5 (frontend consuming API)

### Phase 7: Cleanup & Decommission
**Rationale:** Only after all consumers migrated can old code be safely removed.

**Delivers:**
- Remove public/data/ships.json
- Remove/deprecate src/lib/ship-data.ts
- Remove shipManufacturers array, formatShipImageName(), getShipImagePath()
- Update CLAUDE.md documentation
- 30-day grace period before R2 ship images decommission

**Avoids:**
- Pitfall 10 (R2 dead links) - grace period, redirects to placeholders

**Dependencies:** Phase 5 (all consumers migrated)

### Phase Ordering Rationale

- **Foundation before API before UI**: Each layer depends on the previous. Sync must populate data before API can serve it, API must exist before UI can consume it.
- **Migration as a gate**: The big-bang cutover happens after data infrastructure works but before code expecting UUIDs deploys. No going back after this point.
- **Types pivot point**: Phase 4 type updates are when the codebase switches from name-based to UUID-based references. Data migrated first (Phase 3), then types change, then UI updates.
- **Isolation for testing**: Phases 1-2 are pure backend with no UI changes, testable via API clients. Phase 3 is data-only. Phase 4-5 are code changes consuming validated infrastructure.
- **Pitfall avoidance built-in**: Each phase explicitly addresses specific pitfalls identified in research. Migration includes all prevention strategies for Pitfalls 1-2. Sync includes validation for Pitfall 4. API includes Cosmos DB accommodations for Pitfall 5.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Migration):** Fuzzy name matching algorithms need testing against actual ship name corpus from production database. Cosmos DB transaction limits may require chunked migration strategy research.
- **Phase 6 (Cron Setup):** Azure Timer Function vs external cron service decision needs deployment architecture research. Distributed locking pattern for multi-instance scenarios needs verification.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented MongoDB patterns, existing storage module templates in codebase, FleetYards API confirmed via live testing.
- **Phase 2 (API Routes):** Next.js App Router API routes follow existing patterns (see /api/cron/discord-sync), pagination/filtering is standard REST.
- **Phase 4 (Type Updates):** TypeScript type evolution, standard Zod schema updates, Next.js image config well-documented.
- **Phase 5 (Frontend):** React component updates consuming REST APIs, existing UI patterns in UserFleetBuilder and MissionComposer.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | FleetYards API verified via live calls, node-cron confirmed compatible with Azure App Service standalone mode, MongoDB patterns verified in existing codebase, package versions checked via npm registry |
| Features | HIGH | Table stakes cross-verified across 5+ community tools (FleetYards, RSI Ship Matrix, starcitizen.tools, SC Org Tools, FleetPlanner), FleetYards API structure confirmed to support all planned features |
| Architecture | HIGH | Based on direct codebase analysis of existing storage modules, API routes, and MongoDB client patterns. FleetYards response structure verified via actual API calls. Build order dependencies are logical and tested. |
| Pitfalls | HIGH | Critical pitfalls identified from codebase analysis (name matching complexity in ShipData.ts, Cosmos DB retryWrites limitation in mongodb.ts), FleetYards GitHub issues (CORS errors #3514, schema refactoring #2652), and Cosmos DB compatibility documentation |

**Overall confidence:** HIGH

### Gaps to Address

While research confidence is high, several areas require validation during implementation:

- **Cosmos DB text search performance**: Confirmed text indexes not supported on classic Cosmos DB, but vCore compatibility unclear. May need to test in-memory search vs application-level filtering vs upgrading to vCore for text index support. Validate during Phase 2 API development.

- **FleetYards API rate limits**: Not documented in FleetYards API docs or OpenAPI spec. Conservative approach assumed (1 req/sec with p-limit concurrency=1). Monitor during Phase 1 sync testing for 429 responses or connection throttling.

- **Azure App Service cron persistence**: node-cron lifecycle tied to process lifetime. Documented that "Always On" keeps process alive, but unclear how deployment/scaling events affect cron state. Need to test that lastSyncedAt recovery mechanism works across deployments. Validate during Phase 6.

- **Ship name matching accuracy**: Migration dry-run will reveal actual mismatch rate between current ships.json names and FleetYards canonical names. Research assumes <10% manual mapping required, but if significantly higher, may need manual curation phase. Assess during Phase 3 dry-run.

- **Image CDN reliability**: FleetYards CDN uptime/availability not tracked. No historical data on outage frequency. Decision to skip proxy/cache layer based on simplicity, but may need to revisit if CDN proves unreliable. Monitor in production after Phase 5.

## Sources

### Primary (HIGH confidence)
- **Codebase analysis**: Direct inspection of src/types/ShipData.ts (ship data model, name formatting), src/lib/ship-data.ts (current loader, fuzzy matching), src/lib/mongodb-client.ts (Cosmos DB config with retryWrites:false), src/lib/user-storage.ts (storage pattern), src/app/api/cron/discord-sync/route.ts (cron route pattern), .github/workflows/main_aydocorp.yml (Azure deployment), scripts/next.config.js (image config, standalone output)
- **FleetYards API**: Live inspection of https://api.fleetyards.net/v1/models endpoint with pagination testing (pages 1-15), single ship detail via /v1/models/aurora-mr and /v1/models/carrack, manufacturer endpoint /v1/manufacturers, confirmed UUID format, response structure, CDN hostname (cdn.fleetyards.net), pagination headers
- **npm registry**: Verified versions for node-cron@4.2.1, @types/node-cron@3.0.11, p-limit@7.3.0, zod@4.3.6 vs installed 3.25.76, mongodb@7.0.0 vs installed 6.21.0

### Secondary (MEDIUM confidence)
- **FleetYards GitHub**: Repository at https://github.com/fleetyards/fleetyards showing active maintenance (v5.32.12 Dec 2025, 6672 commits), open issues #2502 (API failures), #3514 (CORS errors), #2652 (schema refactoring effort)
- **Cosmos DB compatibility**: Microsoft Learn feature support for MongoDB 4.0/4.2 API, MongoDB official Cosmos DB support docs, WillowTree migration guide identifying text search and transaction limitations
- **Community tools research**: FleetYards.net, RSI Ship Matrix, starcitizen.tools wiki, SC Org Tools (scorg.tools), FleetPlanner GitHub, Starjump Fleetviewer, Erkul.games, CCU Game, Hangar Link for feature landscape and anti-feature identification
- **Next.js documentation**: Image remotePatterns config, instrumentation hooks for node-cron initialization, standalone output mode

### Tertiary (LOW confidence)
- **Azure App Service behavior**: "Always On" keeps Node.js process alive 24/7 preventing cold starts, but process recycling on deployments/scaling inferred from general Azure docs not specifically tested with Next.js standalone + node-cron
- **UUID migration patterns**: Code with Jason UUID migration lessons, Django UUID migration pitfalls Medium article - different frameworks but applicable patterns for name matching and rollback strategies
- **FleetYards rate limits**: Completely undocumented, conservative 1 req/sec assumption based on community API best practices, not verified

---
*Research completed: 2026-02-03*
*Ready for roadmap: yes*
