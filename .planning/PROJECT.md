# Dynamic Ship Database

## What This Is

Replace AydoCorp's static ship database (`public/data/ships.json` + R2-hosted images) with a dynamic system powered by the FleetYards.net API. Ships sync periodically into Cosmos DB/MongoDB, are referenced by FleetYards UUID throughout the application, and use FleetYards CDN images directly. The ship selection UI (fleet builder, mission planner) gets refreshed to leverage richer data and better images.

## Core Value

The ship database is always current with the latest Star Citizen ships and data without any manual maintenance.

## Requirements

### Validated

- ✓ Static ship database with 500+ ships — existing
- ✓ Ship images served via CDN (images.aydocorp.space) — existing
- ✓ Ship selection in user fleet builder — existing
- ✓ Ship selection in mission planner — existing
- ✓ Ship data in resource management — existing
- ✓ Manufacturer-grouped ship browsing — existing
- ✓ Ship type/size/role filtering — existing
- ✓ Hybrid storage system (MongoDB + JSON fallback) — existing

### Active

- [ ] Periodic sync from FleetYards API into Cosmos DB/MongoDB
- [ ] Ship data stored with FleetYards UUIDs as canonical identifiers
- [ ] Ship images sourced from FleetYards CDN (multiple sizes/views)
- [ ] Cron/scheduled job triggers sync automatically
- [ ] Stale data used gracefully when FleetYards API is unavailable
- [ ] Migration script converts existing ship name references to FleetYards UUIDs
- [ ] All user profile ship references use FleetYards UUIDs
- [ ] All mission/operation ship references use FleetYards UUIDs
- [ ] Ship data API serves from database instead of static JSON
- [ ] Fleet builder UI refreshed with better images and search/filters
- [ ] Mission planner ship picker refreshed with improved UX
- [ ] Old static ships.json and R2 image pipeline decommissioned

### Out of Scope

- In-game pricing / aUEC shop data — adds complexity, not needed for fleet management
- Pledge/real-money pricing — not relevant to org operations
- Ship loaner information — not needed for mission planning
- Mirroring images to R2 — using FleetYards CDN directly, simpler
- Manual admin sync button — cron handles it, can add later if needed
- 3D ship models / holo viewer — interesting but out of scope for this milestone
- Ship comparison tools — would be a separate feature

## Context

- **FleetYards API:** `https://api.fleetyards.net/v1/models` — no auth required, returns rich ship data including multiple image views (angled, front, side, top) in multiple resolutions, manufacturer info, specs, status. 33 manufacturers. Pagination via `page` and `perPage` params.
- **Current ship data flow:** `public/data/ships.json` → `loadShipDatabase()` (cached in memory) → consumed by UserFleetBuilder, MissionPlanner, ResourceManager → images via `cdn()` helper pointing to `images.aydocorp.space`
- **Key types affected:** `Ship`, `ShipDetails`, `ShipManufacturer`, `UserShip`, `MissionShip`, `MissionParticipant`, `OperationParticipant`, `Resource`
- **Key files affected:** `src/types/ShipData.ts`, `src/lib/ship-data.ts`, `src/lib/cdn.ts`, `src/lib/ships/image.ts`, `src/components/UserFleetBuilder.tsx`, `src/components/mission/ShipImage.tsx`, mission planner components
- **Existing storage pattern:** Each entity type has a dedicated `*-storage.ts` module with MongoDB primary + JSON fallback. Ship data should follow this pattern.
- **Brownfield risk:** User profiles (`user.ships[]`), planned missions (`MissionShip`), operations (`OperationParticipant`) all reference ships by name strings currently. Big-bang migration needed.

## Constraints

- **Tech stack**: Next.js 15 / TypeScript / MongoDB (Cosmos DB) — must use existing stack
- **API dependency**: FleetYards API has no SLA — sync must be resilient to downtime
- **Data shape**: FleetYards response structure is fixed — our types adapt to theirs, not vice versa
- **Image dependency**: FleetYards CDN uptime required for ship images — no local fallback planned
- **Migration**: All existing ship references must be migrated before switchover — no dual-format transition period

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use FleetYards API as golden source | Eliminates manual ship list maintenance, always current | — Pending |
| FleetYards UUID as canonical ship identifier | Resilient to ship name changes, proper foreign key | — Pending |
| Periodic sync to database (not live API calls) | Fast page loads, resilience to API downtime | — Pending |
| FleetYards CDN images directly (no R2 mirror) | Simpler architecture, no image sync pipeline | — Pending |
| Big-bang migration for existing references | Clean cutover, no dual-format complexity | — Pending |
| Cron job for sync (no manual trigger) | Automated, one less admin feature to build | — Pending |

---
*Last updated: 2026-02-03 after initialization*
