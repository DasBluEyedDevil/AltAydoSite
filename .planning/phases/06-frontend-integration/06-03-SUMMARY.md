---
phase: 06-frontend-integration
plan: 03
subsystem: mission-planner-ship-picker
tags: [mission-planner, ship-picker, modal, multi-select, useShips, mappers]
completed: 2026-02-04
duration: ~2 min

dependency-graph:
  requires: [phase-02-ship-api, phase-04-type-system, 06-01-hooks-and-mappers]
  provides: [MissionShipPickerModal, rewired-MissionPlannerForm]
  affects: [06-04, 07-cleanup]

tech-stack:
  added: []
  patterns: [useReducer-filter-state, portal-modal, multi-select-checkbox]

key-files:
  created:
    - src/components/ships/MissionShipPickerModal.tsx
  modified:
    - src/components/dashboard/MissionPlannerForm.tsx

decisions:
  - "[06-03]: Map<fleetyardsId, ShipDocument> for pending selections (preserves full ship data for onSelectShips callback)"
  - "[06-03]: Dense list rows in modal (not full cards) for efficient multi-selection scanning"
  - "[06-03]: Replace 'Est. Crew' display with 'Ships: N' (crew data requires static DB lookup, now removed)"
  - "[06-03]: Image fallback set to /assets/ship-placeholder.png (Phase 4 placeholder, not legacy /images/placeholder-ship.png)"
---

# Phase 6 Plan 03: Mission Planner Ship Picker Rewire Summary

Multi-select modal ship picker backed by paginated /api/ships replaces static ShipDropdownPortal in MissionPlannerForm.

## What Was Done

### Task 1: Create MissionShipPickerModal (499dc5f)

**MissionShipPickerModal** (`src/components/ships/MissionShipPickerModal.tsx`):
- 368-line 'use client' component rendering via `createPortal` to `document.body`
- Props: `isOpen`, `onClose`, `onSelectShips(ships: ShipDocument[])`, `existingShipNames`
- `useReducer` for centralized filter state matching ShipBrowsePage pattern:
  - State: page (default 1), pageSize (12), manufacturer, size, classification, productionStatus, search, filterPanelOpen
  - Actions: SET_FILTER (resets page to 1), SET_SEARCH (resets page to 1), SET_PAGE, TOGGLE_FILTER_PANEL, RESET
- `useShips(filters)` hook for paginated data from GET /api/ships
- Pending selections tracked via `Map<string, ShipDocument>` keyed by fleetyardsId
- Reuses existing ship browse components: ShipFilterPanel, ShipSearchBar, ShipPagination
- Dense list rows with: checkbox, 64x40px thumbnail, ship name, manufacturer, size (sm+), crew (md+), status badge
- Already-added ships shown with "Added" badge and disabled checkbox
- "Add N Ship(s) to Roster" footer button visible when selections exist
- Framer Motion animations for backdrop fade and modal scale-in
- Loading spinner, error message, and empty state handling

### Task 2: Rewire MissionPlannerForm (fb3ebbd)

**Removals from MissionPlannerForm** (`src/components/dashboard/MissionPlannerForm.tsx`):
- Removed entire `ShipDropdownPortal` component (lines 156-400, 245 lines)
- Removed `import { ShipDetails } from '@/types/ShipData'`
- Removed `import { loadShipDatabase } from '@/lib/ship-data'`
- Removed `import { shipDetailsToMissionShip } from '@/types/PlannedMission'`
- Removed `ships` state (`useState<ShipDetails[]>`) and `shipsLoading` state
- Removed `useEffect` calling `loadShipDatabase()`
- Removed `shipButtonRef` (useRef no longer needed for fixed-position modal)
- Removed `SearchIcon`, `ChevronDownIcon`, `XIcon` SVG components (unused after portal removal)
- Removed `createPortal` import (modal handles its own portal)
- Removed `useRef` import (no refs remain)
- File reduced from 1091 to 803 lines (26% smaller)

**Additions to MissionPlannerForm**:
- `MissionShipPickerModal` import for modal ship picker
- `shipDocumentToMissionShip` import from `@/lib/ships/mappers`
- `ShipDocument` type import from `@/types/ship`
- `addShips` function now accepts `ShipDocument[]` and uses `shipDocumentToMissionShip` (ships get real fleetyardsId)
- `totalShips` replaces `estimatedCrew` (sum of ship quantities, no static DB lookup needed)
- Ship roster header shows "Ships: N" instead of "Est. Crew: N"
- Ship image fallback changed from `/images/placeholder-ship.png` to `/assets/ship-placeholder.png`
- "Add Ship" button no longer has `rightIcon={<ChevronDownIcon />}` (opens modal, not dropdown)
- `MissionShipPickerModal` rendered outside `AnimatePresence` (handles its own animations internally)

## Decisions Made

- [06-03]: Map<fleetyardsId, ShipDocument> for pending selections -- preserves full ship data for the onSelectShips callback without needing a secondary lookup
- [06-03]: Dense list rows in modal (not full cards) -- optimized for scanning many ships during multi-selection, matching existing ShipDropdownPortal layout density
- [06-03]: Replace "Est. Crew" with "Ships: N" -- the estimated crew calculation required looking up each ship in the static database, which is now removed; crew data is available in the ShipDocument but the ship roster stores MissionShip (which does not carry crew); total ship count is a useful alternative
- [06-03]: Image fallback to /assets/ship-placeholder.png -- Phase 4 created this asset; the old /images/placeholder-ship.png may not exist

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `npm run type-check` passes with zero errors (run after each task and at final)
- `MissionShipPickerModal.tsx` exists at `src/components/ships/MissionShipPickerModal.tsx` with default export
- `MissionPlannerForm.tsx` has zero imports from `@/lib/ship-data` or `@/types/ShipData`
- `MissionPlannerForm.tsx` no longer contains `ShipDropdownPortal` component
- `MissionPlannerForm.tsx` imports and uses `MissionShipPickerModal` and `shipDocumentToMissionShip`
- Ship roster card images use `/assets/ship-placeholder.png` fallback

## Next Phase Readiness

MissionPlannerForm is fully rewired to the dynamic ship API. No blockers for remaining plans:
- **Plan 04** (Fleet Operations): Can proceed independently
- **Plan 05** (Fleet Analytics): Can proceed independently
- **Phase 7** (Cleanup): `shipDetailsToMissionShip` in PlannedMission.ts is now unused by MissionPlannerForm (only remaining consumer is MissionTemplateCreator if any); can be removed in cleanup
