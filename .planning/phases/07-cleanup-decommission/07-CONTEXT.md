# Phase 7: Cleanup & Decommission - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove all legacy static ship data, old loaders, R2 image helpers, and orphaned ship-related code from the codebase. Fix the pre-existing discord.js/zlib-sync build failure. The result is a clean, fully-building codebase with zero references to the old static ship system.

</domain>

<decisions>
## Implementation Decisions

### Removal scope
- Delete `public/data/ships.json` entirely
- Delete `src/lib/ship-data.ts` entirely (not a thin wrapper — full removal)
- Delete `ShipData.ts` entirely (not partial — remove the whole file including `formatShipImageName()`, `getShipImagePath()`, `shipManufacturers`)
- Remove old ship-related type definitions that are superseded by the new `ShipDocument`/`ship.ts` types
- Remove `resolveShipImageLegacy` — Claude verifies no live callers remain, then removes
- Remove any R2/legacy image helpers found during research — Claude sweeps and removes what's clearly orphaned
- Any code marked 'Legacy' or 'deprecated' from earlier phases — Claude checks if still actively called, removes if safe

### Dead code detection
- Aggressive sweep: hunt for all orphaned imports, unused ship-related types, stale CSS classes, and any code that only existed to support the old static system
- Opportunistic cleanup: if obviously dead non-ship code is found during the sweep, remove it too (but don't actively hunt for non-ship dead code)
- Delete local ship image files (everything from FleetYards CDN now) — but preserve icons, logos, banners, and other non-ship assets
- Remove `/assets/ship-placeholder.png` — no local image fallback. Components with image error handlers will need CSS-only placeholders or empty states instead

### Safety & rollback
- Incremental commits: each category of removal gets its own commit (easier to bisect if something breaks)
- Pre-cleanup git tag — Claude decides based on scope
- Hard cut, no feature flags or gradual deprecation

### Build verification
- Fix the discord.js/zlib-sync webpack build failure as part of this phase
- `npm run build` must pass (full build, not just type-check)
- Automated grep scan for all removed identifiers (loadShipDatabase, getShipsByManufacturer, ships.json, formatShipImageName, getShipImagePath, shipManufacturers, etc.) — zero remaining references
- Dev server must start AND key routes must render without errors (ship browse, fleet builder, mission planner)

### Claude's Discretion
- Whether to create a pre-cleanup git tag
- Exact commit grouping within the incremental approach
- How to handle the discord.js/zlib-sync webpack issue (exclude from bundle, polyfill, or restructure)
- CSS-only placeholder design for image error states (replacing the removed ship-placeholder.png)
- Whether `resolveShipImageLegacy` has any remaining callers (remove if safe, migrate if not)
- Scope of R2 image helper removal beyond explicitly listed functions

</decisions>

<specifics>
## Specific Ideas

- "Delete ship images, but make sure not to delete any icons, logos, banners, etc." — careful distinction between ship imagery (from old static system) and site assets
- The placeholder removal means image error handling needs rethinking — CSS background, icon, or empty div instead of a PNG fallback
- Build must fully pass — this is the "clean slate" phase where the project emerges buildable end-to-end

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-cleanup-decommission*
*Context gathered: 2026-02-04*
