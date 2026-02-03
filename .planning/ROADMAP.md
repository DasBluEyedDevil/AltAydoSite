# Roadmap: Dynamic Ship Database

## Overview

Replace AydoCorp's static ship database with a dynamic system powered by the FleetYards.net API. The build sequence flows from data infrastructure (sync engine, storage, API routes) through a critical migration gate (name-to-UUID conversion across all collections), into type system updates that pivot the codebase to UUID-based references, and finally through frontend work (new ship browsing UI, rewiring existing components) before cleaning up legacy code. Seven phases, strictly ordered by dependencies, delivering an always-current ship database with zero manual maintenance.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Sync Engine & Data Model** - Build FleetYards sync infrastructure and ship storage layer
- [ ] **Phase 2: Ship API Routes** - Expose ship data through filtered, paginated REST endpoints
- [ ] **Phase 3: Data Migration** - Convert all existing ship references from names to FleetYards UUIDs
- [ ] **Phase 4: Type System & Image Resolution** - Update TypeScript types and image pipeline for UUID-based references
- [ ] **Phase 5: Ship Browse & Display** - Build new ship browsing UI with multi-axis filtering and detail views
- [ ] **Phase 6: Frontend Integration** - Rewire existing components (fleet builder, mission planner, profiles) to use new API
- [ ] **Phase 7: Cleanup & Decommission** - Remove legacy static ship data, old loaders, and R2 image helpers

## Phase Details

### Phase 1: Sync Engine & Data Model
**Goal**: Ship data from FleetYards is reliably synced into MongoDB and available for downstream consumption
**Depends on**: Nothing (first phase)
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05, SYNC-06, SYNC-07, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. Running the sync populates a `ships` collection with 500+ ship documents containing name, manufacturer, specs, classification, and multiple image URLs
  2. Each ship document uses its FleetYards UUID as the canonical identifier with a unique index enforcing no duplicates
  3. If the FleetYards API is unreachable during a sync attempt, existing ship data in the database is preserved unchanged
  4. Malformed ship records from the API are logged and skipped without blocking the rest of the sync
  5. A sync audit log records every sync run with timestamp, ship count processed, errors encountered, and duration
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md -- Types, Zod schemas, node-cron dependency, env vars
- [x] 01-02-PLAN.md -- FleetYards API client with paginated fetch and response transform
- [x] 01-03-PLAN.md -- Ship storage module and MongoDB indexes
- [x] 01-04-PLAN.md -- Sync orchestrator, cron HTTP endpoint, instrumentation hook

### Phase 2: Ship API Routes
**Goal**: Ship data is queryable through REST endpoints with filtering, search, and batch resolution
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03, API-04
**Success Criteria** (what must be TRUE):
  1. GET /api/ships returns a paginated ship list that can be filtered by any combination of manufacturer, size, role, production status, and text search
  2. GET /api/ships/[id] returns a single ship by either FleetYards UUID or slug
  3. GET /api/ships/batch resolves multiple ships from an array of UUIDs in a single request (for fleet/mission roster display)
  4. GET /api/ships/manufacturers returns a list of all manufacturers with their logos
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Data Migration
**Goal**: All existing ship references across the application are converted from name strings to FleetYards UUIDs
**Depends on**: Phase 1
**Requirements**: MIG-01, MIG-02, MIG-03, MIG-04, MIG-05, MIG-06
**Success Criteria** (what must be TRUE):
  1. Every user profile ship entry (`user.ships[]`) contains a `fleetyardsId` field that resolves to a valid ship document
  2. Every mission and operation participant ship reference contains a `fleetyardsId` that resolves to a valid ship document
  3. The migration achieves 100% match rate -- zero orphaned references remain after execution
  4. Running the migration script a second time produces no changes (idempotent)
  5. A migration report lists every name-to-UUID mapping applied, including which matching strategy was used (exact, slug, contains, manual override)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Type System & Image Resolution
**Goal**: The TypeScript type system and image pipeline expect UUID-based ship references and serve FleetYards CDN images
**Depends on**: Phase 3
**Requirements**: TYPE-01, TYPE-02, TYPE-03, TYPE-04, TYPE-05, TYPE-06
**Success Criteria** (what must be TRUE):
  1. TypeScript compilation succeeds with `UserShip`, `MissionShip`, `MissionParticipant`, and `OperationParticipant` types all requiring `fleetyardsId`
  2. `resolveShipImage()` takes a ship document and view angle (angled/side/top/store) and returns a FleetYards CDN URL
  3. `next.config.js` includes `cdn.fleetyards.net` in `remotePatterns` so Next.js Image component loads FleetYards images without errors
  4. Ship images render correctly from FleetYards CDN with graceful fallback (placeholder) when an image URL is missing or fails to load
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Ship Browse & Display
**Goal**: Users can browse, search, and inspect the full ship database through a rich, filterable UI
**Depends on**: Phase 2, Phase 4
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08
**Success Criteria** (what must be TRUE):
  1. User can filter ships by manufacturer, size, role/classification, and production status simultaneously, with a text search that narrows results in real time
  2. Clicking a ship opens a detail view showing full specs (dimensions, crew, cargo, speed), description, classification, manufacturer logo, and production status
  3. Ship detail view displays multiple image angles (angled, side, top, store) with a view switcher or gallery thumbnail strip
  4. A data freshness indicator is visible showing when ships were last synced (e.g., "Last synced: 2 hours ago")
  5. Ship cards display classification/role labels and key specs (crew, cargo, dimensions) at a glance without opening the detail view
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Frontend Integration
**Goal**: All existing application features (fleet builder, mission planner, profiles) use the new dynamic ship data
**Depends on**: Phase 2, Phase 4
**Requirements**: INT-01, INT-02, INT-03, INT-04, INT-05, INT-06
**Success Criteria** (what must be TRUE):
  1. Fleet builder loads ships from `/api/ships` with search and filtering instead of the static `getShipsByManufacturer()` function
  2. Mission planner ship picker uses `/api/ships` with search, and selected ships display FleetYards images and specs
  3. User profile pages display ships with FleetYards images and manufacturer data
  4. Mission detail views resolve and display ship images from FleetYards CDN for all participants
  5. An org fleet composition dashboard shows aggregate fleet breakdown by role, size, and manufacturer across all org members
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Cleanup & Decommission
**Goal**: All legacy static ship data and old image resolution code is removed from the codebase
**Depends on**: Phase 5, Phase 6
**Requirements**: CLN-01, CLN-02, CLN-03, CLN-04
**Success Criteria** (what must be TRUE):
  1. `public/data/ships.json` no longer exists in the repository
  2. The old `loadShipDatabase()` / `getShipsByManufacturer()` functions in `src/lib/ship-data.ts` are removed or fully deprecated
  3. Legacy helper functions (`formatShipImageName()`, `getShipImagePath()`, `shipManufacturers` array) are removed from `ShipData.ts`
  4. The application builds and runs without any imports referencing removed files or functions
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7
Note: Phases 2 and 3 can execute in parallel (both depend only on Phase 1). Phases 5 and 6 can execute in parallel (both depend on Phase 2 + Phase 4).

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Sync Engine & Data Model | 4/4 | ✓ Complete | 2026-02-03 |
| 2. Ship API Routes | 0/TBD | Not started | - |
| 3. Data Migration | 0/TBD | Not started | - |
| 4. Type System & Image Resolution | 0/TBD | Not started | - |
| 5. Ship Browse & Display | 0/TBD | Not started | - |
| 6. Frontend Integration | 0/TBD | Not started | - |
| 7. Cleanup & Decommission | 0/TBD | Not started | - |
