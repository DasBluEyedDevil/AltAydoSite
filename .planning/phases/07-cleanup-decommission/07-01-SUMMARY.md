---
phase: 07-cleanup-decommission
plan: 01
subsystem: ui
tags: [legacy-removal, ship-images, css-placeholders, imports, cleanup]

# Dependency graph
requires:
  - phase: 06-frontend-integration
    provides: "All live components rewired to dynamic ship DB (FleetYards API)"
provides:
  - "All live source files free of legacy ShipData/ship-data imports"
  - "CSS-only empty states for missing/errored ship images"
  - "getShipPlaceholder returns empty string (no PNG dependency)"
  - "resolveShipImageLegacy and shipDetailsToMissionShip removed"
affects: [07-02 (legacy file deletion), 07-03 (final cleanup)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS-only empty state pattern for missing ship images (consistent across all components)"
    - "getTotalShips replaces getEstimatedCrew (no static DB dependency)"

key-files:
  created: []
  modified:
    - src/lib/ships/image.ts
    - src/types/PlannedMission.ts
    - src/components/dashboard/MissionPlanner.tsx
    - src/components/dashboard/MissionPlannerForm.tsx
    - src/components/UserFleetBuilder.tsx
    - src/components/ships/ShipCard.tsx
    - src/components/ships/ShipCardList.tsx
    - src/components/mission/ShipImage.tsx

key-decisions:
  - "getShipPlaceholder returns empty string -- components handle empty/falsy URLs via CSS"
  - "getTotalShips replaces getEstimatedCrew -- crew data unavailable without static DB, count ships instead"
  - "ShipImage.tsx updated to CSS empty state since resolveShipImageLegacy was removed (deviation Rule 3)"

patterns-established:
  - "CSS empty state: flex items-center justify-center with 'No image' text in mg-primary at 0.3 opacity"

# Metrics
duration: 5min
completed: 2026-02-04
---

# Phase 7 Plan 01: Legacy Import Cleanup Summary

**Severed all live source file dependencies on ShipData.ts/ship-data.ts and replaced placeholder PNG fallbacks with CSS-only empty states**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-04T18:49:17Z
- **Completed:** 2026-02-04T18:54:13Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Removed resolveShipImageLegacy function and all ShipData imports from image.ts
- Removed shipDetailsToMissionShip function and ShipData import from PlannedMission.ts
- Removed loadShipDatabase import, state, and useEffect from MissionPlanner.tsx
- Replaced all placeholder PNG references (ship-placeholder.png, placeholder-ship.png) with CSS-only empty states across 7 components
- Updated getEstimatedCrew to getTotalShips (no longer depends on static ship database)

## Task Commits

Each task was committed atomically:

1. **Task 1: Clean legacy imports and remove legacy functions from library files** - `bee0d7a` (feat)
2. **Task 2: Replace placeholder image fallbacks with CSS empty states in remaining components** - `0723a21` (feat)

## Files Created/Modified
- `src/lib/ships/image.ts` - Removed legacy section (resolveShipImageLegacy, ShipData imports); getShipPlaceholder returns ''
- `src/types/PlannedMission.ts` - Removed ShipData import and shipDetailsToMissionShip function
- `src/components/dashboard/MissionPlanner.tsx` - Removed ShipData/ship-data imports, ship DB state, loadShipDatabase useEffect; replaced getEstimatedCrew with getTotalShips; replaced placeholder images with CSS empty states
- `src/components/dashboard/MissionPlannerForm.tsx` - Replaced placeholder PNG fallback with conditional CSS empty state
- `src/components/UserFleetBuilder.tsx` - Changed image error fallback from placeholder PNG to CSS empty state
- `src/components/ships/ShipCard.tsx` - Replaced onError placeholder fallback with imgError state + CSS empty state
- `src/components/ships/ShipCardList.tsx` - Replaced onError placeholder fallback with imgError state + CSS empty state
- `src/components/mission/ShipImage.tsx` - Replaced resolveShipImageLegacy usage with CSS empty state (no longer uses Image component)

## Decisions Made
- getShipPlaceholder returns empty string instead of PNG path -- all components now handle falsy image URLs via CSS empty state divs
- Replaced getEstimatedCrew (which looked up crew counts from static ship database) with getTotalShips (simple quantity sum) since crew data is no longer available without the static DB
- Updated label from "crew" to "ships" in the mission list and detail views to reflect the changed calculation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed ShipImage.tsx which imported removed resolveShipImageLegacy**
- **Found during:** Task 1 (after removing resolveShipImageLegacy from image.ts)
- **Issue:** src/components/mission/ShipImage.tsx imported resolveShipImageLegacy which no longer exists, causing TypeScript compilation error
- **Fix:** Replaced the entire component body to render a CSS empty state div instead of using the removed legacy function. This component is used by MissionComposer.tsx (old legacy mission planner) and will be deleted in Plan 02.
- **Files modified:** src/components/mission/ShipImage.tsx
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** bee0d7a (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to maintain type-check passing. The file was an additional consumer of resolveShipImageLegacy not listed in the plan's files_modified. No scope creep.

## Issues Encountered
- Legacy fleet-ops components (MissionComposer.tsx, MissionForm.tsx, TestShipImages.tsx) still import from ShipData.ts and ship-data.ts, but these are legacy files scheduled for deletion in Plan 02, not live source files. TypeScript type-check passes because these components are not referenced from any route that triggers strict checking.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All live source files are free of legacy imports -- ShipData.ts and ship-data.ts can now be safely deleted in Plan 02
- Legacy fleet-ops/mission-planner components (MissionComposer, MissionForm, TestShipImages) still reference legacy files but are themselves legacy and will be deleted in Plan 02
- No blockers for Plan 02 execution

---
*Phase: 07-cleanup-decommission*
*Completed: 2026-02-04*
