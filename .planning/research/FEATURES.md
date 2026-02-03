# Feature Landscape: Dynamic Ship Database with FleetYards API Sync

**Domain:** Star Citizen org management tool -- ship database and fleet operations
**Researched:** 2026-02-03
**Overall confidence:** MEDIUM-HIGH (verified against FleetYards API responses, RSI Ship Matrix, starcitizen.tools wiki, and multiple community tools)

---

## Context: What Exists Today in AydoCorp

The current implementation uses:
- A **static JSON file** (`public/data/ships.json`) with ~200+ ships containing: name, manufacturer, type, size, role[], crewRequirement, maxCrew, cargoCapacity, length/beam/height, mass, speedSCM, speedBoost
- A **hardcoded manufacturer list** in `ShipData.ts` with ship-to-manufacturer mappings and image name formatting
- **Ship images** resolved via CDN by name convention (lowercase, underscores, strip special chars)
- **UserFleetBuilder** component: manufacturer dropdown -> ship dropdown -> add to profile
- **MissionComposer** ship selection: manufacturer filter, text search, multi-select checkboxes
- **Fleet Database page**: placeholder "Coming Soon"

Gaps relative to the ecosystem:
- No ship detail views (only names and one image angle)
- No data freshness awareness (no lastUpdated, no patch version)
- No comparison capability
- No dynamic sync (manual JSON maintenance)
- No rich media (single image angle, no store images, no top/side views)

---

## Table Stakes

Features users expect from any Star Citizen ship database. Missing = product feels incomplete or amateurish compared to FleetYards, RSI Ship Matrix, or starcitizen.tools.

| # | Feature | Why Expected | Complexity | Dependencies | Notes |
|---|---------|--------------|------------|--------------|-------|
| T1 | **Multi-axis search and filter** | RSI Ship Matrix, FleetYards, and every community tool filters by manufacturer, size, role, production status, and text search simultaneously. Users will try to filter by role+size immediately. | Medium | Ship data model must include all filter fields | Current code only has manufacturer + text search in MissionComposer. Need size, role, status as filter facets. |
| T2 | **Ship detail card/panel** | FleetYards shows full specifications on click. starcitizen.tools wiki devotes entire pages. RSI Ship Matrix has 3-panel layout (Systems, Technical Overview, Holoviewer). Users expect to see specs at a glance. | Medium | T1 (needs a card to click from), image pipeline | Currently zero detail display. MissionComposer shows name + image only. |
| T3 | **Multiple ship image views** | FleetYards API provides angledView, sideView, topView, storeImage, fleetchartImage in multiple resolutions (small/medium/large/xlarge). RSI has holoviewer. starcitizen.tools wiki shows 6+ angles per ship. Single image angle is noticeably sparse. | Low-Medium | FleetYards API integration | API already exposes all views. Main work is UI to cycle/display them. Current CDN images are single-angle only. |
| T4 | **Manufacturer browsing with logos** | FleetYards API returns manufacturer name, longName, code, and logo URL. RSI Ship Matrix groups by manufacturer. Every org tool supports manufacturer filtering. AydoCorp already has this but without logos or branding. | Low | FleetYards manufacturer endpoint | API provides logo CDN URLs. Low effort to enhance existing manufacturer dropdown. |
| T5 | **Ship specs display (dimensions, crew, cargo, speeds)** | Every reference tool shows at minimum: length/beam/height, crew min/max, cargo SCU, SCM speed. These are the "baseball card stats" -- users compare ships on these attributes constantly. | Low | Ship data model | Current JSON has most of these fields. FleetYards adds mass, fuel tank sizes, acceleration/deceleration. |
| T6 | **Production status indicator** | FleetYards, RSI Ship Matrix, and starcitizen.tools all clearly indicate whether a ship is Flight Ready, In Production, or In Concept. Org tools must show this so members know what they can actually fly. | Low | FleetYards API `productionStatus` field | Critical for mission planning -- can't assign concept ships to missions. |
| T7 | **Data sync from external API** | The entire point of this milestone. FleetYards data updates with each SC patch. Manual JSON maintenance is not sustainable with 200+ ships and quarterly patches. | High | API client, caching layer, error handling, fallback to local | Core architectural feature. Everything else depends on this working. |
| T8 | **Graceful degradation / offline fallback** | Current app already has hybrid storage (Cosmos DB + local JSON). Ship data must follow same pattern. If FleetYards API is down, the app must still work. | Medium | T7, existing fallback pattern | Existing pattern in codebase (see storage system). Extend to ship data. |
| T9 | **Ship classification/role display** | FleetYards provides `classification` (e.g., "Exploration"), `classificationLabel`, and `focus` (e.g., "Expedition"). RSI uses "Focus" categories. starcitizen.tools uses career paths. Users expect clear role labeling. | Low | FleetYards API fields | Current JSON has `role[]` array. API adds classification and focus as structured data. |

---

## Differentiators

Features that set AydoCorp apart from generic ship browsers. Not expected in every tool, but valued by org members. These provide competitive advantage for an **org management tool** specifically.

| # | Feature | Value Proposition | Complexity | Dependencies | Notes |
|---|---------|-------------------|------------|--------------|-------|
| D1 | **Org fleet composition dashboard** | SC Org Tools, FleetPlanner, and Starjump all show aggregate fleet views. AydoCorp can show "our org has 12 cargo ships, 8 fighters, 3 capital ships" with role breakdown. Unique to org tools vs generic ship browsers. | Medium | T1, T9, user fleet data from profiles | Aggregate user ships from profiles. Show pie/bar charts by role, size, manufacturer. |
| D2 | **Mission-aware ship selection** | Current MissionComposer already selects ships for missions. Enriching ship cards in the mission context with specs (cargo for haul missions, weapons for combat, crew for multi-crew ops) helps mission leaders make informed assignments. | Medium | T2, T5, mission planner integration | Existing integration point in MissionComposer. Enhance with richer ship data. |
| D3 | **Ship comparison (side-by-side)** | FleetYards has "Compare Ships." RSI Ship Matrix has comparison. StarShip42 was famous for it. Useful for org members deciding which ship variant to bring. | Medium-High | T2, T5 | 2-4 ship comparison table. Can be deferred to post-MVP if needed. |
| D4 | **Data freshness indicators** | Show "Last synced: 2 hours ago" or "Data current as of SC patch 4.6." No community tool does this well. FleetYards has `lastUpdatedAt` per ship. Builds trust that data is current. | Low | T7, FleetYards `lastUpdatedAt` field | Simple UI indicator. Low effort, high trust signal. |
| D5 | **Image gallery with view switcher** | Beyond just showing multiple images (T3), provide a smooth gallery UX: thumbnail strip, click to enlarge, view angle selector (front/side/top/angled/store). Aligns with MobiGlas aesthetic. | Medium | T3, Framer Motion (already in project) | FleetYards provides 5+ image types per ship, each in multiple resolutions. |
| D6 | **Smart ship suggestions for missions** | Given a mission type (Cargo Haul), automatically suggest ships with high cargo capacity. For Bounty Hunting, suggest combat-focused ships. For Mining, suggest mining ships. | Medium | T1, T9, D2, mission type data | Filter/sort ships by relevance to mission type. Uses existing `BuilderMissionType` enum. |
| D7 | **Fleet gap analysis** | "Your org has no dedicated medical ships" or "You're heavy on fighters but light on haulers." Helps org leadership with recruitment and fleet planning. | Medium-High | D1, role taxonomy, threshold config | Requires defining what a "balanced" fleet looks like. Opinionated feature. |
| D8 | **Manufacturer detail pages** | Click a manufacturer logo to see all their ships, lore description, logo, and how many org members fly their ships. Uses FleetYards manufacturer data + aggregated org data. | Low-Medium | T4, D1 | Nice browsing experience. Low complexity with API data already available. |
| D9 | **Loaner ship awareness** | FleetYards API includes `loaners` array. When a concept ship is assigned to a profile, show what the player actually flies in-game right now. Critical for mission planning accuracy. | Low-Medium | T6, FleetYards `loaners` field | Practical value for org operations. Rarely seen in community tools. |
| D10 | **Ship availability / purchase locations** | FleetYards API `availability` includes `soldAt`/`boughtAt`/`rentalAt` with shop locations and prices. Show where members can buy/rent ships in-game. | Low-Medium | T7, FleetYards availability data | Useful for members trying to acquire ships the org needs. |

---

## Anti-Features

Features to explicitly NOT build in this milestone. Common mistakes in ship database projects or scope traps.

| # | Anti-Feature | Why Avoid | What to Do Instead |
|---|--------------|-----------|-------------------|
| A1 | **Full loadout/component builder** | Erkul.games already does this extremely well. Building a component loadout system is a massive scope sink (weapons, shields, coolers, power plants, quantum drives -- each with sizes, grades, manufacturers). It would dwarf the ship database effort. | Link out to Erkul for loadout planning. Show component hardpoint counts (from API) but not a full builder. |
| A2 | **3D ship viewer / holoviewer** | StarShip42 (now retired) and Starjump Fleetviewer spent years on 3D rendering. FleetYards provides GLTF holo files but rendering them is a separate massive project. Not aligned with MobiGlas 2D aesthetic. | Use the high-quality 2D renders from FleetYards (angledView, sideView, topView). Consider linking to Starjump for 3D viewing. |
| A3 | **Trade route calculator** | FleetYards marks their trade routes as "outdated." SC Org Tools has mining calculators. Trade data changes every patch and requires commodity pricing databases. Completely different domain. | Out of scope. If needed later, use SC Trade Tools or UEX Corp APIs. |
| A4 | **CCU chain optimizer** | CCU Game (ccugame.app) and Hangar Link specialize in this. Complex logic around pledge prices, warbond discounts, and upgrade chains. Not relevant to org operations. | Link out to CCU Game. |
| A5 | **Ship price tracking / pledge store monitoring** | FleetYards has `onSale` flag and pledge prices. But building price alerts, sale notifications, and historical price tracking is a separate product. | Show current pledge price from API as static info. No tracking/alerting. |
| A6 | **Scraping RSI for real-time data** | RSI doesn't have a public API. Scraping is brittle, violates TOS potentially, and FleetYards already does the hard work of normalizing RSI data. | Use FleetYards API exclusively. It already syncs with RSI Ship Matrix. |
| A7 | **User-submitted ship data corrections** | Opens a moderation can of worms. FleetYards maintainers already curate data quality. | Trust FleetYards as source of truth. Report issues upstream. |
| A8 | **Real-time game data integration** | In-game ship stats from game files (`p4k` data mining) differ from Ship Matrix data. Dual data sources create confusion. | Use FleetYards API which normalizes both sources. Don't maintain a separate data pipeline. |
| A9 | **Fleet value calculator** | Calculating total fleet value in USD/aUEC is contentious (insurance, gifts, packages, warbond vs store credit). Not useful for operations. | Show individual ship prices if available. Don't aggregate or calculate fleet "worth." |

---

## Feature Dependencies

```
T7 (API Sync) ──────────────────────────────────────────────────────┐
  │                                                                  │
  ├── T8 (Offline Fallback)                                          │
  │                                                                  │
  ├── T1 (Multi-axis Filter) ──────┬── T2 (Ship Detail Card) ───── D3 (Comparison)
  │                                │         │                       │
  │                                │         ├── D5 (Image Gallery)  │
  │                                │         │                       │
  │                                │         └── D2 (Mission-aware)──D6 (Smart Suggestions)
  │                                │
  │                                └── D1 (Org Fleet Dashboard) ── D7 (Gap Analysis)
  │
  ├── T3 (Multiple Images) ──── D5 (Image Gallery)
  │
  ├── T4 (Manufacturer Browse) ── D8 (Manufacturer Pages)
  │
  ├── T5 (Ship Specs Display)
  │
  ├── T6 (Production Status) ── D9 (Loaner Awareness)
  │
  ├── T9 (Classification/Role)
  │
  └── D4 (Data Freshness Indicators)
      D10 (Ship Availability)
```

**Critical path:** T7 -> T8 -> T1 -> T2 -> rest of table stakes -> differentiators

---

## MVP Recommendation

For this milestone (dynamic ship database with API sync), prioritize in this order:

### Phase 1: Foundation (must ship)
1. **T7 - API Sync** -- Core infrastructure. Server-side FleetYards API client with caching, pagination handling, and error recovery. Without this, nothing else works.
2. **T8 - Offline Fallback** -- Extend existing hybrid storage pattern to ship data. Seed local fallback from initial API fetch.
3. **T5 - Ship Specs Display** -- Update the `ShipDetails` type to include all FleetYards fields. This is the data model everything builds on.
4. **T6 - Production Status** -- Simple field addition with big operational value.
5. **T9 - Classification/Role** -- Map FleetYards classification to existing role system.

### Phase 2: Browse and Filter (must ship)
6. **T1 - Multi-axis Filter** -- Manufacturer + size + role + status + text search. Replaces current basic filtering across both Fleet Database page and MissionComposer.
7. **T4 - Manufacturer Browse with Logos** -- Enhance existing manufacturer dropdown with API logos.
8. **T3 - Multiple Image Views** -- Wire up angledView/sideView/topView/storeImage from API.
9. **T2 - Ship Detail Card/Panel** -- Clicking a ship shows full specs, multiple images, and metadata. This is the "wow" moment.
10. **D4 - Data Freshness Indicators** -- Low effort, high trust signal.

### Phase 3: Org Integration (stretch for milestone)
11. **D2 - Mission-aware Ship Selection** -- Enhance MissionComposer with richer ship data.
12. **D1 - Org Fleet Composition Dashboard** -- Aggregate fleet view on the Fleet Database page.
13. **D5 - Image Gallery** -- Polished image viewing experience with thumbnails.

### Defer to Future Milestones
- **D3 (Comparison)**: Medium-high complexity, can live without it initially
- **D6 (Smart Suggestions)**: Requires D2 to be mature first
- **D7 (Gap Analysis)**: Requires D1 and a role taxonomy discussion
- **D8 (Manufacturer Pages)**: Nice-to-have, not blocking any workflow
- **D9 (Loaner Awareness)**: Useful but niche
- **D10 (Ship Availability)**: Pure reference data, low priority

---

## Key Data Model Upgrade

The FleetYards API returns significantly richer data than the current `ShipDetails` interface. Key fields to add:

| Current Field | FleetYards Equivalent | New Fields to Add |
|---------------|----------------------|-------------------|
| name | name | slug, scIdentifier, rsiName |
| manufacturer (string) | manufacturer (object) | manufacturer.code, manufacturer.logo, manufacturer.longName |
| size | metrics.size/sizeLabel | (compatible, add label) |
| role[] | classification + focus | classificationLabel, focus |
| crewRequirement | crew.min | (compatible) |
| maxCrew | crew.max | (compatible) |
| cargoCapacity | metrics.cargo | (compatible, add label) |
| length/beam/height | metrics.length/beam/height | metrics.mass, fuel tanks |
| speedSCM | speeds.scmSpeed | acceleration/deceleration values |
| image (single) | media.angledView/sideView/topView/storeImage/fleetchartImage | Full media object with multiple views and sizes |
| (none) | productionStatus | Add as new field |
| (none) | pledgePrice | Add as new field |
| (none) | lastUpdatedAt | Add as new field |
| (none) | loaners[] | Add as new field |
| (none) | availability | Add as new field (phase 2+) |
| (none) | holo (GLTF URL) | Store but don't render in this milestone |
| (none) | description | Add for detail card |
| (none) | links (storeUrl, salesPageUrl) | Add for external references |

---

## Sources

- [FleetYards.net](https://fleetyards.net/) -- PRIMARY: Ship database and API (verified via direct API calls to `api.fleetyards.net/v1/models`)
- [FleetYards GitHub](https://github.com/fleetyards/fleetyards) -- Open source, GPLv3, Ruby on Rails + Vue.js
- [RSI Ship Matrix](https://robertsspaceindustries.com/en/ship-matrix) -- Official CIG ship data source (FleetYards syncs from this)
- [Star Citizen Wiki (starcitizen.tools)](https://starcitizen.tools/Ships) -- Community wiki with detailed ship pages
- [SC Org Tools](https://scorg.tools/) -- Org management toolkit with fleet manager
- [FleetPlanner (GitHub)](https://github.com/gavin-orsetti/FleetPlanner) -- Desktop fleet planning tool with task group model
- [Starjump Fleetviewer](https://robertsspaceindustries.com/community-hub/post/starjump-fleetviewer-zmdsfodshfjh1) -- 3D fleet visualization tool
- [Erkul DPS Calculator (erkul.games)](https://erkul.games) -- Loadout builder (anti-feature reference)
- [CCU Game](https://ccugame.app/) -- CCU chain optimizer (anti-feature reference)
- [Hangar Link](https://hangar.link/) -- Fleet management and CCU tools
- [RSI Ship Technical Information](https://robertsspaceindustries.com/en/comm-link/engineering/16172-The-Shipyard-Ship-Technical-Information) -- Official ship stat methodology

### Confidence Notes

| Area | Confidence | Reason |
|------|------------|--------|
| FleetYards API structure | HIGH | Verified via direct API calls (`/v1/models/carrack`, `/v1/models/aurora-mr`, `/v1/manufacturers`) |
| Table stakes features | HIGH | Cross-verified across 5+ community tools (FleetYards, RSI Matrix, starcitizen.tools, SC Org Tools, FleetPlanner) |
| Anti-features | MEDIUM-HIGH | Based on domain knowledge of existing specialized tools; verified tool URLs and feature sets |
| Data freshness patterns | MEDIUM | Inferred from SC patch cycle patterns and FleetYards `lastUpdatedAt` field; exact sync frequency not verified |
| Org fleet features (D1, D7) | MEDIUM | Based on SC Org Tools and FleetPlanner patterns; specific implementation patterns for aggregation not deeply researched |
