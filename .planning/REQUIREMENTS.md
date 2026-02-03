# Requirements: Dynamic Ship Database

**Defined:** 2026-02-03
**Core Value:** The ship database is always current with the latest Star Citizen ships and data without any manual maintenance.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Sync Engine

- [x] **SYNC-01**: FleetYards API client fetches all ships via paginated GET requests to `/v1/models`
- [x] **SYNC-02**: Sync service transforms FleetYards response into internal ship schema via explicit field mapping
- [x] **SYNC-03**: Ships are upserted to MongoDB `ships` collection keyed on FleetYards UUID
- [x] **SYNC-04**: Sync is triggered via Azure scheduled job (matching existing Discord sync pattern)
- [x] **SYNC-05**: If FleetYards API is unavailable, existing ship data is preserved (never wiped)
- [x] **SYNC-06**: Each ship record is Zod-validated before writing; malformed records are logged and skipped
- [x] **SYNC-07**: Sync audit log records each run: timestamp, ships processed, errors, duration

### Ship Data Model

- [x] **DATA-01**: Ship documents store FleetYards UUID as canonical identifier
- [x] **DATA-02**: Ship documents include: name, slug, manufacturer (name/code/logo), classification, focus, crew min/max, cargo, dimensions, mass, speeds, production status
- [x] **DATA-03**: Ship documents include multiple image URLs: store, angled, side, top views in multiple resolutions
- [x] **DATA-04**: Ship documents include description and external links (RSI store URL)
- [x] **DATA-05**: MongoDB indexes created for: UUID (unique), slug (unique), manufacturer code, production status, text search (name + manufacturer)
- [x] **DATA-06**: `lastSyncedAt` and `syncVersion` tracked per ship for staleness detection

### Ship API

- [ ] **API-01**: `GET /api/ships` returns paginated ship list with filter params: manufacturer, size, role, status, search text
- [ ] **API-02**: `GET /api/ships/[id]` returns single ship by UUID or slug
- [ ] **API-03**: `GET /api/ships/batch` resolves multiple ships by UUID array (for mission rosters, user fleets)
- [ ] **API-04**: `GET /api/ships/manufacturers` returns manufacturer list with logos

### Migration

- [ ] **MIG-01**: Migration script converts all user profile ship references (`user.ships[]`) from name strings to FleetYards UUIDs
- [ ] **MIG-02**: Migration script converts all planned mission ship references (`MissionShip`, `MissionParticipant`) to FleetYards UUIDs
- [ ] **MIG-03**: Migration script converts all operation participant ship references to FleetYards UUIDs
- [ ] **MIG-04**: Migration script converts all resource records (type "Ship") to FleetYards UUIDs
- [ ] **MIG-05**: Name matching uses multi-pass strategy: exact match, slug match, RSI name match, contains match, manual override map
- [ ] **MIG-06**: Migration script is idempotent (safe to run multiple times)

### Type Updates

- [ ] **TYPE-01**: `UserShip` type updated: `fleetyardsId` added, `image` field removed (resolved at render time)
- [ ] **TYPE-02**: `MissionShip` type updated with `fleetyardsId` field
- [ ] **TYPE-03**: `MissionParticipant` type updated with `fleetyardsId` field
- [ ] **TYPE-04**: `OperationParticipant` type updated with `fleetyardsId` field
- [ ] **TYPE-05**: `next.config.js` updated with `cdn.fleetyards.net` in `remotePatterns`
- [ ] **TYPE-06**: Ship image resolution uses new `resolveShipImage()` that takes ship document and view angle

### Ship Browse & Display

- [ ] **UI-01**: Ship list page with multi-axis filtering: manufacturer, size, role/classification, production status, text search — all combinable
- [ ] **UI-02**: Ship detail card/panel shows full specs, description, multiple image views, manufacturer logo, classification
- [ ] **UI-03**: Multiple ship image views displayed: angled, side, top, store — with ability to switch between views
- [ ] **UI-04**: Manufacturer logos shown in dropdowns and ship cards
- [ ] **UI-05**: Ship specs displayed on cards: dimensions, crew min/max, cargo SCU, SCM speed
- [ ] **UI-06**: Classification/role labels shown on ship cards (e.g., "Exploration", "Combat", "Freight")
- [ ] **UI-07**: Data freshness indicator shows last sync timestamp (e.g., "Last synced: 2 hours ago")
- [ ] **UI-08**: Image gallery with thumbnail strip and view angle switcher (angled/side/top/store)

### Frontend Integration

- [ ] **INT-01**: Fleet builder (`UserFleetBuilder`) uses `/api/ships` instead of static `getShipsByManufacturer()`
- [ ] **INT-02**: Mission planner ship picker uses `/api/ships` with search and filtering
- [ ] **INT-03**: Mission detail views resolve ship images from ship documents via FleetYards CDN
- [ ] **INT-04**: User profile displays ships with FleetYards images and specs
- [ ] **INT-05**: Mission-aware ship cards show relevant specs for mission type (cargo for haul, crew for multi-crew)
- [ ] **INT-06**: Org fleet composition dashboard: aggregate view of org fleet by role, size, manufacturer

### Cleanup

- [ ] **CLN-01**: `public/data/ships.json` removed
- [ ] **CLN-02**: `src/lib/ship-data.ts` (old static loader) removed or deprecated
- [ ] **CLN-03**: `shipManufacturers` array and `formatShipImageName()`/`getShipImagePath()` functions removed from `ShipData.ts`
- [ ] **CLN-04**: Old R2 image path resolution helpers removed

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Ship Comparison

- **CMP-01**: Side-by-side comparison of 2-4 ships with all specs
- **CMP-02**: Comparison shareable via URL

### Smart Features

- **SMART-01**: Smart ship suggestions for missions based on mission type (cargo ships for haul, fighters for combat)
- **SMART-02**: Fleet gap analysis ("Your org has no dedicated medical ships")
- **SMART-03**: Manufacturer detail pages with all ships and org member counts

### Extended Data

- **EXT-01**: Loaner ship awareness (show what you actually fly if ship is in concept)
- **EXT-02**: In-game purchase/rental locations from FleetYards availability data
- **EXT-03**: Production status history/timeline

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full loadout/component builder | Erkul.games does this well; massive scope for weapons, shields, coolers, power plants |
| 3D ship viewer / holoviewer | Starjump/StarShip42 territory; conflicts with MobiGlas 2D aesthetic |
| Trade route calculator | Different domain entirely; commodity data changes every patch |
| CCU chain optimizer | CCU Game specializes in this; not relevant to org operations |
| Pledge price tracking/alerts | Building price monitoring is a separate product |
| RSI scraping | FleetYards already normalizes RSI data; scraping violates TOS |
| User-submitted data corrections | Opens moderation burden; FleetYards maintains data quality |
| Real-time game data mining | FleetYards normalizes both sources already |
| Fleet value calculator | Contentious (insurance, gifts, packages); not useful for operations |
| Image mirroring to R2 | Using FleetYards CDN directly; simpler architecture |
| Manual admin sync button | Azure job handles scheduling; can add later if needed |
| Dry-run migration mode | Adds complexity; migration is idempotent so can be re-run safely |

## Traceability

| Requirement | Phase | Phase Name | Status |
|-------------|-------|------------|--------|
| SYNC-01 | Phase 1 | Sync Engine & Data Model | Complete |
| SYNC-02 | Phase 1 | Sync Engine & Data Model | Complete |
| SYNC-03 | Phase 1 | Sync Engine & Data Model | Complete |
| SYNC-04 | Phase 1 | Sync Engine & Data Model | Complete |
| SYNC-05 | Phase 1 | Sync Engine & Data Model | Complete |
| SYNC-06 | Phase 1 | Sync Engine & Data Model | Complete |
| SYNC-07 | Phase 1 | Sync Engine & Data Model | Complete |
| DATA-01 | Phase 1 | Sync Engine & Data Model | Complete |
| DATA-02 | Phase 1 | Sync Engine & Data Model | Complete |
| DATA-03 | Phase 1 | Sync Engine & Data Model | Complete |
| DATA-04 | Phase 1 | Sync Engine & Data Model | Complete |
| DATA-05 | Phase 1 | Sync Engine & Data Model | Complete |
| DATA-06 | Phase 1 | Sync Engine & Data Model | Complete |
| API-01 | Phase 2 | Ship API Routes | Pending |
| API-02 | Phase 2 | Ship API Routes | Pending |
| API-03 | Phase 2 | Ship API Routes | Pending |
| API-04 | Phase 2 | Ship API Routes | Pending |
| MIG-01 | Phase 3 | Data Migration | Pending |
| MIG-02 | Phase 3 | Data Migration | Pending |
| MIG-03 | Phase 3 | Data Migration | Pending |
| MIG-04 | Phase 3 | Data Migration | Pending |
| MIG-05 | Phase 3 | Data Migration | Pending |
| MIG-06 | Phase 3 | Data Migration | Pending |
| TYPE-01 | Phase 4 | Type System & Image Resolution | Pending |
| TYPE-02 | Phase 4 | Type System & Image Resolution | Pending |
| TYPE-03 | Phase 4 | Type System & Image Resolution | Pending |
| TYPE-04 | Phase 4 | Type System & Image Resolution | Pending |
| TYPE-05 | Phase 4 | Type System & Image Resolution | Pending |
| TYPE-06 | Phase 4 | Type System & Image Resolution | Pending |
| UI-01 | Phase 5 | Ship Browse & Display | Pending |
| UI-02 | Phase 5 | Ship Browse & Display | Pending |
| UI-03 | Phase 5 | Ship Browse & Display | Pending |
| UI-04 | Phase 5 | Ship Browse & Display | Pending |
| UI-05 | Phase 5 | Ship Browse & Display | Pending |
| UI-06 | Phase 5 | Ship Browse & Display | Pending |
| UI-07 | Phase 5 | Ship Browse & Display | Pending |
| UI-08 | Phase 5 | Ship Browse & Display | Pending |
| INT-01 | Phase 6 | Frontend Integration | Pending |
| INT-02 | Phase 6 | Frontend Integration | Pending |
| INT-03 | Phase 6 | Frontend Integration | Pending |
| INT-04 | Phase 6 | Frontend Integration | Pending |
| INT-05 | Phase 6 | Frontend Integration | Pending |
| INT-06 | Phase 6 | Frontend Integration | Pending |
| CLN-01 | Phase 7 | Cleanup & Decommission | Pending |
| CLN-02 | Phase 7 | Cleanup & Decommission | Pending |
| CLN-03 | Phase 7 | Cleanup & Decommission | Pending |
| CLN-04 | Phase 7 | Cleanup & Decommission | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after roadmap creation*
