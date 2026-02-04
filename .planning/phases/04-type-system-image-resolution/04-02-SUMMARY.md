---
phase: 04-type-system-image-resolution
plan: 02
subsystem: image-resolution
tags: [typescript, image-resolution, fleetyardsId, api-validation, cdn, ship-images]
requires:
  - phase-04-01 (type definitions with fleetyardsId, next.config.js with CDN)
provides:
  - resolveShipImage(images, view) for document-based ship image resolution
  - resolveShipImageLegacy(model) for backward-compatible name-based resolution
  - ShipImageView and ShipImages type exports
  - Profile API validation requiring fleetyardsId (UUID) with optional image
  - Planned missions API validation requiring fleetyardsId instead of image
affects:
  - phase-05 (ship browse UI can use resolveShipImage with ShipDocument.images)
  - phase-06 (frontend integration rewires components from Legacy to new function)
  - phase-07 (cleanup removes resolveShipImageLegacy and image field)
tech-stack:
  added: []
  patterns:
    - Document-based image resolution with view-angle fallback chain
    - Legacy function preservation with @deprecated for phased migration
    - UUID validation on fleetyardsId in Zod schemas
key-files:
  created: []
  modified:
    - src/lib/ships/image.ts
    - src/app/api/profile/route.ts
    - src/app/api/planned-missions/route.ts
    - src/components/mission/ShipImage.tsx
    - src/components/UserFleetBuilder.tsx
key-decisions:
  - "resolveShipImage fallback chain: requested view -> angled -> store -> placeholder"
  - "Legacy function renamed to resolveShipImageLegacy (not overloaded) for clean separation"
  - "Component imports updated to resolveShipImageLegacy immediately to keep type-check green"
  - "Profile route fleetyardsId validated as UUID (stricter than plain string from 04-01)"
patterns-established:
  - "View-angle resolution with viewMap for extensible image source mapping"
  - "Legacy function pattern: rename + @deprecated + update callers to new name"
duration: ~2 min
completed: 2026-02-04
---

# Phase 4 Plan 02: Image Resolution & API Validation Summary

**One-liner:** Document-based resolveShipImage with angled/store/placeholder fallback chain, legacy function preserved as resolveShipImageLegacy, API routes now validate fleetyardsId (UUID) instead of requiring image.

## Performance

- Duration: ~2 minutes
- 2 tasks, 2 commits
- 5 files changed (1 rewritten, 2 API routes updated, 2 component imports renamed)

## Accomplishments

1. **New resolveShipImage(images, view)** -- Accepts ShipImages object and ShipImageView, resolves through candidate keys with fallback chain (requested view -> angled -> store -> placeholder)
2. **ShipImageView and ShipImages types exported** -- Matching ShipDocument.images shape exactly, enabling type-safe image resolution across the app
3. **Legacy function preserved** -- Old name-based resolution renamed to resolveShipImageLegacy with @deprecated JSDoc tag
4. **Component imports updated** -- ShipImage.tsx and UserFleetBuilder.tsx now import resolveShipImageLegacy (import rename only, no logic changes)
5. **Profile API validation tightened** -- fleetyardsId validated as UUID format; manual ship validation checks fleetyardsId instead of image
6. **Planned missions validation updated** -- validateMissionShips checks fleetyardsId instead of image

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Rewrite resolveShipImage with document-based resolution | a2cc1cb | src/lib/ships/image.ts, src/components/mission/ShipImage.tsx, src/components/UserFleetBuilder.tsx |
| 2 | Update profile and planned-missions API validation for fleetyardsId | 7a65c4e | src/app/api/profile/route.ts, src/app/api/planned-missions/route.ts |

## Files Changed

### Modified
- `src/lib/ships/image.ts` -- Complete rewrite: new resolveShipImage(images, view), legacy resolveShipImageLegacy(model), ShipImageView type, ShipImages type, viewMap fallback table
- `src/app/api/profile/route.ts` -- fleetyardsId z.string() -> z.string().uuid(); manual validation: ship.image -> ship.fleetyardsId
- `src/app/api/planned-missions/route.ts` -- validateMissionShips: ship.image -> ship.fleetyardsId
- `src/components/mission/ShipImage.tsx` -- Import rename: resolveShipImage -> resolveShipImageLegacy
- `src/components/UserFleetBuilder.tsx` -- Import rename: resolveShipImage -> resolveShipImageLegacy

## Decisions Made

1. **Rename over overload** -- Chose to rename the old function to `resolveShipImageLegacy` and update 2 component imports rather than using TypeScript overloads. Cleaner separation, explicit deprecation, and simpler for Phase 6 to find all legacy call sites.
2. **UUID validation on fleetyardsId** -- Tightened from `z.string()` (set in 04-01) to `z.string().uuid()` to reject malformed identifiers at the API boundary.
3. **Fallback chain order** -- angled view is the preferred cross-view fallback because it provides the most recognizable ship silhouette, followed by store image, then placeholder.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Profile route fleetyardsId was z.string() not z.string().uuid()**
- **Found during:** Task 2 pre-implementation review
- **Issue:** Plan 04-01 added fleetyardsId as `z.string()` without UUID validation; plan 04-02 specifies `z.string().uuid()`
- **Fix:** Updated to `z.string().uuid()` for proper format validation
- **Files modified:** src/app/api/profile/route.ts
- **Commit:** 7a65c4e

**2. [Rule 3 - Blocking] MissionComposer.tsx does not import resolveShipImage**
- **Found during:** Task 1 grep check
- **Issue:** Plan listed MissionComposer.tsx as needing import rename, but grep showed it does not import resolveShipImage
- **Fix:** Skipped (no action needed). Only ShipImage.tsx and UserFleetBuilder.tsx needed import updates.
- **No commit impact** -- plan was conservative; actual scope was smaller.

## Issues & Risks

None. All verification checks pass:
- `npm run type-check` exits 0
- Both API routes validate fleetyardsId
- Both component files show only import rename changes (4 insertions, 4 deletions)
- Legacy function preserved for existing consumers

## Next Phase Readiness

Phase 4 is now complete (both plans executed). Ready for:
- **Phase 5 (Ship Browse UI):** resolveShipImage(images, view) available for rendering ship images from ShipDocument data
- **Phase 6 (Frontend Integration):** Components can migrate from resolveShipImageLegacy to resolveShipImage as they adopt ShipDocument
- API routes accept fleetyardsId-based ship data without requiring image field
