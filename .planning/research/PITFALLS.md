# Domain Pitfalls: FleetYards API Integration

**Domain:** Third-party API data sync (Star Citizen ship database) into existing Next.js/MongoDB production application
**Researched:** 2026-02-03
**Overall Confidence:** HIGH (based on codebase analysis, FleetYards API probing, Cosmos DB documentation, and domain research)

---

## Critical Pitfalls

Mistakes that cause data corruption, broken user experiences, or require emergency rollbacks.

---

### Pitfall 1: Name-Matching Migration Produces Orphaned or Mismatched Ship References

**What goes wrong:** The migration script that converts existing ship name strings (in `user.ships[]`, `MissionParticipant.shipName`, `OperationParticipant.shipName`, `MissionShip.shipName`, `PlannedMission.ships[]`) to FleetYards UUIDs fails to match a significant percentage of ships because the names don't align exactly.

**Why it happens:** The current `ships.json` uses names like `"Constellation Andromeda"` but FleetYards may store it differently (e.g., with manufacturer prefix `"RSI Constellation Andromeda"` or shortened `"Andromeda"`). The codebase already has evidence of naming inconsistencies -- the hardcoded `shipManufacturers` array in `ShipData.ts` uses `"CNOU (Consolidated Outland)"` while FleetYards uses `"Consolidated Outland"`, and `"Kruger Intergalatic"` (sic) vs the correct `"Kruger Intergalactic"`. Special character ships like `"San'tok.yai"` have their own bespoke handling (`formatShipImageName` special-cases it). Ship names also change between Star Citizen patches -- CIG regularly renames ships (e.g., Hornet variants got "Mk I"/"Mk II" suffixes in 3.x patches).

**Consequences:**
- User fleet profiles lose ships silently (UUID becomes null, ship disappears from profile)
- Historical missions reference ships that can't be resolved, breaking mission detail views
- Operations show participants with no ship assignment even though they had one before migration
- The `MissionShip.image` field in `PlannedMission` records stores absolute image URLs pointing to the old R2 CDN -- these become stale after migration even if the UUID matches

**Warning signs:**
- Migration dry-run reports >5% unmatched ships
- Any ship with special characters (apostrophes, periods, diacritics) fails to match
- Ships added between the last `ships.json` update and the FleetYards sync have no match candidates

**Prevention:**
1. Build a **name-mapping table** before migration: dump all unique ship name strings from every MongoDB collection (`users.ships[].name`, `missions.participants[].shipName`, `operations.participants[].shipName`, `planned-missions.ships[].shipName`), then run each against the FleetYards API with fuzzy matching
2. Use a **multi-pass matching strategy**: exact match first, then case-insensitive, then with/without manufacturer prefix, then Levenshtein distance for typos, then manual mapping for known discrepancies
3. Require **100% match rate** before migration proceeds -- any unmatched ship name must be manually resolved into a mapping entry
4. Store the **original ship name alongside the UUID** during migration (e.g., `shipNameLegacy` field) so the old name is recoverable
5. Write a **verification query** that runs post-migration to confirm every document that had a ship reference still has one

**Phase:** Must be completed in the Migration phase. The mapping table should be built during the Sync Engine phase as a development artifact.

---

### Pitfall 2: Big-Bang Migration Corrupts Production Data with No Rollback Path

**What goes wrong:** The migration runs against production MongoDB/Cosmos DB, updates thousands of documents across multiple collections simultaneously, and either partially fails (leaving half the data in old format, half in new) or succeeds but introduces subtle bugs discovered days later when users report broken profiles.

**Why it happens:** The PROJECT.md explicitly states "big-bang migration" with "no dual-format transition period." This means every ship reference across `users`, `missions`, `operations`, `planned-missions`, and `escort-requests` collections must be updated atomically. Cosmos DB's transaction support is severely limited: multi-document transactions only work within an unsharded collection (not across collections), and the transaction timeout is 5 seconds (30 seconds on vCore). A cross-collection migration cannot be transactional on Cosmos DB.

**Consequences:**
- Partial migration leaves the application in an inconsistent state where some code expects UUIDs and other data still has name strings
- Users see broken profiles, missing fleet data, or corrupted mission records
- Rollback requires restoring from backup, losing any data created between backup and rollback
- If the backup is stale (even by hours), user profile edits, new missions, new registrations are lost

**Warning signs:**
- Migration script has no dry-run mode
- No pre-migration backup verification step
- Migration doesn't track progress per-collection (so you don't know where it stopped on failure)
- No rollback script exists

**Prevention:**
1. Take a **point-in-time Cosmos DB backup** immediately before migration and verify it's restorable
2. Implement migration as **per-collection sequential updates** with progress tracking (store last-processed document ID so it can resume)
3. Add a **schema version field** to each collection (e.g., `_schemaVersion: 2`) so code can detect pre/post-migration documents
4. Build the **rollback script before the migration script** -- if you can't reverse it, don't run it
5. Put the application in **read-only mode** (or maintenance page) during migration to prevent new data from being created in the old format
6. Run the migration on a **staging copy of production data first** and verify with automated checks before touching production

**Phase:** Migration phase exclusively. The maintenance mode mechanism should be built in the API/UI phase as preparation.

---

### Pitfall 3: FleetYards CDN Goes Down and All Ship Images Break Site-Wide

**What goes wrong:** After switching from self-hosted R2 images (`images.aydocorp.space`) to FleetYards CDN images, a FleetYards CDN outage causes every ship image across the entire site to display as broken/missing images -- fleet profiles, mission planners, operation views, ship selection dropdowns, and the resource archive page all show empty boxes or broken image icons.

**Why it happens:** The PROJECT.md explicitly states "FleetYards CDN uptime required for ship images -- no local fallback planned" and "Mirroring images to R2 -- using FleetYards CDN directly, simpler." FleetYards is a community-maintained project with no SLA. Their GitHub issues show CORS errors (#3514) and API failures (#2502). The CDN could go down for maintenance, domain expiration, or the maintainer taking a break. The current `next.config.js` only whitelists `images.aydocorp.space` in `remotePatterns` -- FleetYards domains aren't even configured yet.

**Consequences:**
- Every ship image on the site breaks simultaneously (the `UserFleetBuilder`, `MissionDetail`, `OperationDetailView`, `ShipImage` components all render broken images)
- The existing `onError` handler in `UserFleetBuilder` catches individual failures but the fallback placeholder (`/assets/ship-placeholder.png`) gives a degraded experience for the entire ship catalog
- User perception: the site looks broken/abandoned even though it's only an image CDN issue
- No way to fix it without a code change or waiting for FleetYards to come back

**Warning signs:**
- FleetYards CDN returns 5xx errors or connection timeouts during development/testing
- CORS errors appear in browser console for FleetYards image URLs
- Image load times are significantly slower than the self-hosted R2 CDN
- FleetYards changes their image URL structure (they've had schema refactoring effort #2652)

**Prevention:**
1. Implement a **ship image proxy/cache layer**: store the FleetYards image URL in the ship document but serve images through a Next.js API route or edge function that caches to local storage / R2 / blob storage with a configurable TTL (e.g., 24 hours). This decouples display from CDN availability
2. If the proxy is too complex for this milestone: at minimum, use the existing `onError` pattern in all image components with a **high-quality placeholder per ship size category** (not just one generic placeholder) and add `fleetyards.net` to Next.js `remotePatterns` in `next.config.js`
3. **Store image URLs in the ship database document** during sync so they're served from your API, not constructed client-side from a CDN base URL. If the CDN URL structure changes, only the sync needs updating, not client code
4. Set up a **health check** that periodically tests FleetYards image URLs and alerts if failure rate exceeds a threshold

**Phase:** Must be designed in the Sync Engine phase (image URL storage) and implemented in the API/UI phase (error handling, proxy if chosen). The `next.config.js` update is needed at the very start.

---

### Pitfall 4: Sync Job Silently Overwrites Good Data with Stale or Malformed API Response

**What goes wrong:** The FleetYards API returns unexpected data (empty array for a page, missing fields on a ship, null values where strings were expected, or an entirely different schema version) and the sync job writes this data directly into the ships collection, replacing previously good data.

**Why it happens:** Community APIs evolve without versioned contracts or changelogs. The FleetYards API is based on an OpenAPI 3.0.3 spec but the documentation page showed only minimal configuration -- no detailed schema guarantees. The response from `api.fleetyards.net/v1/models?page=15&perPage=25` returned an empty `[]` during testing, which means pagination can overshoot silently. If the sync job interprets an empty response as "no ships exist" and does a replace-all, the entire ship collection gets wiped.

**Consequences:**
- Ship collection in MongoDB goes from 500+ records to 0 (if replace-all on empty response)
- Ship collection gets partial data (if API paginates differently than expected)
- Ship details have null/undefined fields that crash components expecting strings
- `crewRequirement`, `cargoCapacity`, `size` fields change types or go missing, breaking mission planner filtering

**Warning signs:**
- Sync returns significantly fewer ships than expected (<400 when 500+ are known to exist)
- Sync response includes ships with null `name` or null `manufacturer`
- API response structure doesn't match the TypeScript types without transformation
- Empty pages appear before the full dataset is consumed

**Prevention:**
1. **Never replace-all**: use upsert-by-UUID for each ship, and only mark ships as inactive/archived if they disappear from the API for N consecutive syncs (not on the first absence)
2. **Validate the total count**: FleetYards likely returns pagination headers or total count. Compare the total ships received against the expected range (e.g., 400-700 for current Star Citizen). Abort sync if count is <80% of previous sync count
3. **Schema validation on each ship record** before writing: require non-null `id`, `name`, `manufacturer.name` at minimum. Log and skip malformed records rather than writing them
4. **Keep a `lastSyncedAt` timestamp** and `syncVersion` counter. Never delete the previous sync data until the new sync is validated
5. **Store raw API response** (or at least a hash + count) in a sync audit log for debugging

**Phase:** Sync Engine phase. The validation logic is core to the sync implementation, not an afterthought.

---

## Moderate Pitfalls

Mistakes that cause delays, degraded performance, or technical debt.

---

### Pitfall 5: Cosmos DB MongoDB Compatibility Gaps Break Sync or Query Operations

**What goes wrong:** The sync engine or ship query API uses MongoDB features that aren't supported by Azure Cosmos DB's MongoDB compatibility layer, causing silent data loss, incorrect query results, or runtime errors in production.

**Why it happens:** The existing codebase already accounts for this with `retryWrites: false` in `mongodb.ts` (Cosmos DB 3.6 doesn't support retryable writes). However, new ship collection operations might use unsupported features:
- Bulk write operations with `$lookup` (not fully supported in RU-based Cosmos DB)
- Text search indexes for ship name search (not supported in classic Cosmos DB)
- `$regex` with case-insensitive flag causes full collection scans instead of using indexes
- `bulkWrite` with `ordered: false` may behave differently under Cosmos DB's partition model
- If the ship collection uses a partition key, cross-partition queries for "list all ships" will fan out and be expensive

**Consequences:**
- Ship search by name becomes extremely slow (full collection scan on 500+ documents per query)
- Bulk upsert during sync fails partway through and doesn't report which records succeeded
- Aggregation queries for statistics (ship count by manufacturer, size distribution) return incorrect results
- RU consumption spikes unexpectedly during sync, potentially hitting Cosmos DB throttling limits (429 errors)

**Warning signs:**
- `429 Too Many Requests` errors from Cosmos DB during or after sync
- Ship search queries take >500ms
- Index creation fails silently (the existing pattern in `mongo-indexes.ts` catches and ignores errors)
- Cosmos DB billing shows unexpected RU consumption after sync job runs

**Prevention:**
1. **Test every query against Cosmos DB specifically**, not just local MongoDB. Queries that work on local MongoDB 7.x may fail on Cosmos DB 4.2 compat
2. Use simple indexes only -- no text indexes, no compound indexes with more than 8 keys. Check the Cosmos DB 4.2 feature support matrix before writing any new query
3. For ship name search, use **application-level filtering** on the cached dataset rather than database `$regex` queries. The ship collection is small enough (~500 docs) to cache in memory
4. During sync, use **individual upsert operations** with error handling per document, not bulk writes. This is slower but more reliable on Cosmos DB
5. Create a **dedicated ship collection index** for the UUID field and the slug/name field early, and verify it exists before running sync
6. Monitor RU consumption with `db.collection.stats()` or Azure metrics after each sync run

**Phase:** Sync Engine phase (query design) and API phase (search implementation).

---

### Pitfall 6: Ship Data Schema Drift Between FleetYards Versions and Local Types

**What goes wrong:** The FleetYards API response schema evolves (fields renamed, nested objects restructured, new fields added, image URL formats changed) and the TypeScript types in the codebase become stale. The sync continues to "work" but either drops new fields or crashes on renamed ones.

**Why it happens:** The FleetYards API is at v1 but is actively maintained (their GitHub shows ongoing releases and schema refactoring effort #2652). There's no webhook, changelog subscription, or schema versioning guarantee. Star Citizen itself adds new ship properties with major patches (e.g., new fuel types, new size categories, module systems) that FleetYards reflects.

**Consequences:**
- New ship data fields (e.g., quantum fuel capacity, module slots) are silently discarded during sync
- Changed field names cause the sync to write null/undefined for previously populated fields
- Image URL structure changes break all images (e.g., if they move from `fleetyards.net/uploads/` to a different CDN path)
- Type mismatches cause runtime crashes in components that assume field types (e.g., `ship.crew.min` restructured to `ship.minCrew`)

**Warning signs:**
- Sync logs show `undefined` or `null` for fields that should have values
- New ships added to the game appear with incomplete data compared to older ships
- TypeScript `any` casts creep in to suppress type errors after API changes

**Prevention:**
1. **Map from API response to internal types explicitly** -- never store the raw FleetYards response directly. Write a `mapFleetYardsShipToLocalShip()` transformer function that picks only known fields and provides defaults for missing ones
2. **Log dropped/unknown fields** during sync at the `warn` level so new API fields are discovered passively
3. **Pin the sync to specific known fields** and treat everything else as optional metadata. The core fields are: `id` (UUID), `name`, `slug`, `manufacturer.name`, `manufacturer.code`, `classification`, `crew.min`, `crew.max`, `metrics.cargo`, `metrics.length`, `metrics.beam`, `metrics.height`, `metrics.mass`, `productionStatus`, and `media` (image URLs)
4. **Version the transformer function** so when FleetYards makes breaking changes, you can update the mapper without changing the storage schema
5. Add an **integration test** that fetches one page from the live FleetYards API and validates the response matches expected field presence (run weekly, not on every deploy)

**Phase:** Sync Engine phase (transformer design). Integration test in the Testing phase.

---

### Pitfall 7: Cron Job Execution Issues on the Deployment Platform

**What goes wrong:** The scheduled sync job either doesn't run, runs too frequently, runs multiple times concurrently, or gets killed mid-execution due to platform timeout limits.

**Why it happens:** The application deploys to Azure as a standalone Next.js app. The execution context for cron/scheduled tasks depends entirely on the hosting model:
- **Azure App Service**: No built-in cron for Next.js. Requires Azure Functions, Logic Apps, or an external cron service to trigger a sync API endpoint
- **Serverless functions**: Have execution time limits (typically 10-60 seconds). Syncing 500+ ships with pagination could easily exceed this
- **Multiple instances**: If the app runs on multiple instances (scaling), each instance might trigger its own sync, causing duplicate writes or race conditions
- **Cold starts**: The first sync after a deployment might fail because the database connection isn't established yet

**Consequences:**
- Ship data goes stale for days/weeks because the sync never actually runs
- Concurrent syncs create duplicate ships or trigger Cosmos DB throttling
- Long-running sync gets killed at 50% completion, leaving partial data
- Sync appears to work in development but fails silently in production

**Warning signs:**
- No sync audit records in the database after deployment
- Ship data still shows previous patch information after a Star Citizen update
- Cosmos DB metrics show double the expected write operations during sync windows
- Application logs show timeout errors from the sync endpoint

**Prevention:**
1. **Make the sync endpoint idempotent and resumable**: track which page was last successfully synced so a killed job can resume
2. **Use a distributed lock** (e.g., a `sync-locks` collection with a TTL document) to prevent concurrent syncs across instances
3. **Implement the sync as a paginated, chunked operation**: fetch one page, upsert those ships, record progress, fetch next page. If killed, resume from last page
4. **Protect the sync endpoint** with a secret token (`CRON_SECRET` header) so it can only be triggered by the legitimate cron service
5. **Choose the cron trigger approach based on deployment**: for Azure App Service, use Azure Timer Trigger Function or an external cron service like cron-job.org to hit the sync API endpoint
6. **Set sync frequency to once daily** (not hourly) -- ship data changes only with Star Citizen patches (roughly monthly). Over-syncing wastes RUs and risks hitting FleetYards rate limits
7. Log every sync execution (start time, end time, ships processed, errors) to a `sync-audit` collection

**Phase:** Sync Engine phase (idempotency, locking, pagination) and Deployment phase (cron trigger setup).

---

### Pitfall 8: Ship Name Search After UUID Migration Breaks User Workflows

**What goes wrong:** After migration to UUIDs, the ship selection UI in the fleet builder and mission planner no longer supports the fuzzy name matching that users relied on. Users can't find ships because the search only works on exact UUID matches or the FleetYards canonical name, which may differ from what they're used to typing.

**Why it happens:** The current `getShipByName()` function in `ShipData.ts` has a multi-pass fuzzy search: direct name match, then type match, then partial includes in both directions. The current `UserFleetBuilder` uses `getShipsByManufacturer()` for dropdown population. After migration, if the ship selection switches to a database-backed API that searches by UUID or exact name, the fuzzy matching is lost. FleetYards ship names may also use different conventions than what users have memorized (e.g., `"F7C-M Super Hornet Mk II"` vs. `"Super Hornet"`).

**Consequences:**
- Users can't find their ship in the fleet builder because they're searching for `"Super Hornet"` but the canonical name is `"F7C-M Super Hornet Mk II"`
- Mission planners take longer because the ship selection UX regresses from the current experience
- Users report "my ship is gone" when it's actually present but under a different name

**Warning signs:**
- User complaints increase after the migration goes live
- Ship selection usage (add ship events) drops measurably compared to before migration
- Support requests about "can't find my ship"

**Prevention:**
1. **Build a searchable name index** that includes the canonical name, common aliases, short names, and the ship's slug. For example, index both `"F7C-M Super Hornet Mk II"` and `"Super Hornet"`
2. **Preserve the manufacturer-grouped dropdown UX** from the current `UserFleetBuilder` -- don't switch to a search-only interface without also keeping the browse-by-manufacturer flow
3. **Include the ship's previous name** (from the pre-migration `ships.json`) as a searchable alias in the database
4. **Add autocomplete/typeahead** that searches across name, slug, manufacturer, and role fields simultaneously
5. **Test the new UI with actual users** (or at least with the pre-migration ship name list) to verify that every ship currently in users' fleets can be found through the new selection interface

**Phase:** API/UI phase. The search index design should be part of the Sync Engine schema.

---

## Minor Pitfalls

Mistakes that cause annoyance, minor bugs, or extra work but are quickly fixable.

---

### Pitfall 9: `next.config.js` Missing FleetYards Domain in Image RemotePatterns

**What goes wrong:** FleetYards CDN images fail to load in production because the Next.js Image component blocks external domains not listed in `remotePatterns`.

**Why it happens:** The current `next.config.js` (in `scripts/next.config.js`) only whitelists `images.aydocorp.space` and `aydocorp.space`. FleetYards images come from a different domain (likely `fleetyards.net` or a CDN subdomain). If anyone uses `<Image>` (Next.js optimized) instead of `<img>` for ship images, it will fail in production.

**Prevention:**
1. Add FleetYards CDN domains to `remotePatterns` in `next.config.js` at the start of the project, before any image work begins
2. Identify the exact FleetYards image domain(s) from the API response `media` field and add all of them
3. Consider using `unoptimized={true}` on FleetYards images to avoid double-optimization costs (FleetYards already provides multiple resolutions)

**Phase:** Very first task -- prerequisite for any image work.

---

### Pitfall 10: Existing R2 CDN Image References Become Dead Links After Migration

**What goes wrong:** After migration, old `user.ships[].image` values still contain R2 CDN URLs (e.g., `https://images.aydocorp.space/constellation_andromeda.png`). If the R2 bucket is decommissioned before all references are updated, these become dead links. Also, `MissionShip.image` fields in `PlannedMission` documents store absolute R2 URLs that aren't part of the UUID migration.

**Why it happens:** The migration focuses on converting ship name strings to UUIDs, but image URL fields are separate strings that may not be updated by the same migration. The `PlannedMission` type stores `image: string` as an absolute URL, not a reference to the ship database. Historical mission records will forever contain old R2 URLs unless explicitly migrated.

**Prevention:**
1. **Include image URL migration** in the ship reference migration script -- update `user.ships[].image` and `MissionShip.image` fields alongside the UUID conversion
2. **Don't decommission the R2 bucket** until a grace period (e.g., 30 days) after migration, to catch missed references
3. Consider **redirecting the R2 domain** to serve placeholder images or FleetYards equivalents, rather than returning 404s
4. For historical missions (completed/archived), accept that images may break and use the ship placeholder fallback gracefully

**Phase:** Migration phase (image URL update). R2 decommission in a post-migration cleanup phase.

---

### Pitfall 11: Memory Pressure from Caching 500+ Ship Records with Full Image Metadata

**What goes wrong:** The current `loadShipDatabase()` in `ship-data.ts` caches all ships in a module-level variable (`shipCache`). After the FleetYards migration, each ship record will be significantly larger (multiple image URLs in multiple resolutions, full specs, availability data) which increases memory usage. On a serverless platform, this cache is lost on every cold start, requiring a fresh database fetch.

**Why it happens:** The current `ships.json` is lean (~20 fields per ship). A FleetYards ship record with media, pricing, availability, and full specs could be 10-20x larger. Caching 500 of these in memory uses non-trivial RAM, and the cache lifetime is unpredictable on serverless.

**Prevention:**
1. **Store only the fields you need** in the ships collection (the mapper function from Pitfall 6 naturally handles this)
2. **Use a lean projection** when querying ships for list views (name, UUID, manufacturer, size, primary image only -- not full specs)
3. Consider **ISR (Incremental Static Regeneration)** or **server-side caching** with a TTL for the ship list API endpoint, rather than in-memory caching per request
4. If using in-memory cache, set a **cache size limit** and eviction strategy

**Phase:** API phase (query projection design) and Sync Engine phase (storage schema -- only store needed fields).

---

### Pitfall 12: Inconsistent Ship Data During Sync Window

**What goes wrong:** While the sync job is running (potentially taking 30-60 seconds for 500+ ships across paginated API calls), different API requests to the application may return different ship data -- some requests see the old data, some see partially-updated data.

**Why it happens:** The upsert-by-UUID approach means ships are updated one page at a time. A user browsing ships during this window might see a mix of old and new data, or might get a stale cache hit followed by fresh data.

**Prevention:**
1. **Accept eventual consistency** -- for a daily sync of reference data, brief inconsistency is tolerable
2. **Invalidate the in-memory ship cache** only after the full sync completes, not during
3. If stronger consistency is needed: sync into a **staging collection** (`ships_staging`), then atomically rename/swap collections after validation
4. Use a `lastSyncCompletedAt` timestamp that the API layer checks to decide whether to invalidate its cache

**Phase:** Sync Engine phase (cache invalidation strategy).

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation | Severity |
|-------|---------------|------------|----------|
| **Sync Engine** | Empty API page interpreted as "delete all" (P4) | Validate total count before committing | Critical |
| **Sync Engine** | FleetYards schema change breaks transformer (P6) | Explicit field mapping with defaults | Moderate |
| **Sync Engine** | Concurrent sync instances on multi-node deploy (P7) | Distributed lock document with TTL | Moderate |
| **Ship Data Model** | Cosmos DB doesn't support text search indexes (P5) | In-memory or application-level search | Moderate |
| **Migration** | Name-to-UUID matching fails for 10%+ of ships (P1) | Pre-migration mapping table with manual overrides | Critical |
| **Migration** | Partial failure leaves mixed format data (P2) | Per-collection progress tracking + rollback script | Critical |
| **Migration** | Image URLs not updated alongside ship references (P10) | Include image migration in same script | Minor |
| **API/UI** | FleetYards CDN outage breaks all ship images (P3) | Proxy layer or comprehensive error handling | Critical |
| **API/UI** | Ship search UX regresses after UUID switch (P8) | Searchable alias index + preserve browse UX | Moderate |
| **API/UI** | Next.js blocks FleetYards images (P9) | Add remotePatterns before any image work | Minor |
| **Deployment** | Cron job doesn't trigger in Azure hosting (P7) | External cron service + audit logging | Moderate |
| **Post-Migration** | R2 decommission breaks historical references (P10) | 30-day grace period + redirects | Minor |

---

## Sources

- **Codebase analysis**: `src/types/ShipData.ts`, `src/lib/ship-data.ts`, `src/types/user.ts` (UserShip), `src/types/Mission.ts` (MissionParticipant), `src/types/Operation.ts` (OperationParticipant), `src/types/PlannedMission.ts` (MissionShip), `src/lib/mongodb.ts`, `src/lib/mongo-indexes.ts`, `scripts/next.config.js` -- HIGH confidence
- **FleetYards API probing**: Live API calls to `api.fleetyards.net/v1/models` confirming UUID format, response structure, empty page behavior, and manufacturer naming -- HIGH confidence
- **FleetYards GitHub Issues**: [#2502](https://github.com/fleetyards/fleetyards/issues/2502) (API data pull failures), [#3514](https://github.com/fleetyards/fleetyards/issues/3514) (CORS errors), [#2652](https://github.com/fleetyards/fleetyards/issues/2652) (schema refactoring) -- MEDIUM confidence
- **Cosmos DB compatibility**: [Microsoft Learn - Feature support 4.0](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/feature-support-40), [MongoDB Cosmos DB compatibility docs](https://www.mongodb.com/docs/drivers/cosmosdb-support/), [WillowTree migration guide](https://www.willowtreeapps.com/craft/azure-cosmos-db-mongo-api-5-things-to-know-before-you-migrate) -- HIGH confidence
- **Next.js image handling**: [next/image fallback discussion #19544](https://github.com/vercel/next.js/discussions/19544), [next/image CDN issue #33488](https://github.com/vercel/next.js/issues/33488) -- MEDIUM confidence
- **UUID migration patterns**: [Code with Jason - UUID migration lessons](https://www.codewithjason.com/lessons-learned-converting-database-ids-uuids/), [Django UUID migration pitfalls](https://medium.com/@mahmood.nasr/migrating-from-integer-id-to-uuid-in-django-hidden-pitfalls-and-how-to-solve-them-7f16c5e46dc5) -- MEDIUM confidence (different frameworks, same patterns)
- **PROJECT.md decisions**: FleetYards CDN-only (no R2 mirror), big-bang migration (no dual-format), cron-only sync (no manual trigger) -- from `.planning/PROJECT.md` -- HIGH confidence
