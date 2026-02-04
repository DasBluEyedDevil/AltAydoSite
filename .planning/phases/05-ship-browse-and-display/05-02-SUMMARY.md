---
phase: 05-ship-browse-and-display
plan: 02
subsystem: ui
tags: [react, next-image, framer-motion, heroicons, mobiglas, ship-cards]

# Dependency graph
requires:
  - phase: 05-ship-browse-and-display/01
    provides: "useShips hook, format utilities, ShipDocument type"
  - phase: 04-type-system-image-resolution
    provides: "resolveShipImage, ShipImageView, image fallback chain"
provides:
  - "ShipCard grid card component with store image, name, manufacturer, classification"
  - "ShipCardList compact row component with thumbnail"
  - "ShipGrid container with grid/list toggle, loading skeletons, empty state"
affects:
  - "05-ship-browse-and-display/03 (ship browse page assembles these components)"
  - "05-ship-browse-and-display/04 (ship detail panel triggered by card clicks)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Image error fallback via useState + onError swapping to placeholder"
    - "AnimatePresence mode=wait for smooth view transitions"
    - "Grid/list toggle with MobiGlasButton variant switching (outline/ghost)"

key-files:
  created:
    - "src/components/ships/ShipCard.tsx"
    - "src/components/ships/ShipCardList.tsx"
    - "src/components/ships/ShipGrid.tsx"
  modified: []

key-decisions:
  - "Image error handled via React state (useState + onError) rather than CSS-only fallback"
  - "24 skeleton placeholders matching default pageSize for consistent loading UX"
  - "Manufacturer column hidden on small screens in list view (sm:block) to prevent overflow"

patterns-established:
  - "Ship card image pattern: resolveShipImage -> useState -> onError fallback to placeholder"
  - "View toggle pattern: MobiGlasButton outline=active, ghost=inactive"

# Metrics
duration: 2min
completed: 2026-02-03
---

# Phase 5 Plan 2: Ship Card Components & Grid/List View Summary

**ShipCard (grid), ShipCardList (list row), and ShipGrid container with view toggle, loading skeletons, and empty state using MobiGlas theme**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-03
- **Completed:** 2026-02-03
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- ShipCard renders image-heavy grid cards with ship name, store image via resolveShipImage, manufacturer name, and classification badge
- ShipCardList renders compact horizontal rows with thumbnail, name, manufacturer, and classification for scannable list browsing
- ShipGrid container provides switchable grid/list layouts with MobiGlasButton toggle, 24-item loading skeletons, and empty state with guidance message
- All components use framer-motion for entry animations and view transitions

## Task Commits

Each task was committed atomically:

1. **Task 1: ShipCard and ShipCardList components** - `1a13ace` (feat)
2. **Task 2: ShipGrid container with view toggle and loading skeletons** - `390871f` (feat)

## Files Created
- `src/components/ships/ShipCard.tsx` - Image-heavy grid card showing ship name, store image, manufacturer, classification badge with hover scale animation
- `src/components/ships/ShipCardList.tsx` - Compact horizontal row with 64x40 thumbnail, name, manufacturer, classification for list view
- `src/components/ships/ShipGrid.tsx` - Grid/list container with view toggle buttons, 24-skeleton loading state, empty state, and AnimatePresence transitions

## Decisions Made
- Image error handling via React useState + onError rather than CSS-only fallback -- provides reliable swap to placeholder PNG when CDN images fail
- 24 skeleton placeholders to match the default page size, giving consistent visual density during loading
- Manufacturer column in list view uses `hidden sm:block` to prevent layout overflow on mobile while keeping alignment on larger screens

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ship card components ready for assembly into browse page (Plan 03)
- ShipGrid accepts ships array and callbacks -- ready to wire to useShips hook from Plan 01
- onShipClick callback ready for ship detail panel integration (Plan 04)

---
*Phase: 05-ship-browse-and-display*
*Completed: 2026-02-03*
