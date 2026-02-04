---
phase: 06-frontend-integration
plan: 02
subsystem: fleet-builder-rewire
tags: [fleet-builder, ship-picker, modal, useShipBatch, FleetYards-CDN]
completed: 2026-02-04
duration: ~4 min

dependency-graph:
  requires: [phase-02-ship-api, phase-04-type-system, phase-05-ship-browse-ui, 06-01]
  provides: [fleet-ship-picker-modal, rewired-fleet-builder, dynamic-fleet-display]
  affects: [06-03, 06-04, 06-05, phase-07-cleanup]

tech-stack:
  added: []
  patterns: [modal-ship-picker, useReducer-filter-state, batch-resolution-display, createPortal]

key-files:
  created:
    - src/components/ships/FleetShipPickerModal.tsx
  modified:
    - src/components/UserFleetBuilder.tsx
    - src/components/UserFleetBuilderWrapper.tsx
    - src/components/UserProfilePanel.tsx
---

# Phase 6 Plan 02: Fleet Builder Rewire Summary

Fleet builder rewired from static ShipData dropdowns to dynamic ship API with full modal picker and FleetYards CDN image display via batch resolution.

## What Was Done

### Task 1: Create FleetShipPickerModal (068c941)

**FleetShipPickerModal** (`src/components/ships/FleetShipPickerModal.tsx`):
- Full overlay modal rendered via `createPortal` to `document.body` (z-[9999])
- Uses `useReducer` for filter state management (matching 05-05 pattern):
  - State: page, pageSize (12), manufacturer, size, classification, productionStatus, search
  - Actions: SET_FILTER (resets page), SET_SEARCH (resets page), SET_PAGE, TOGGLE_FILTER_PANEL, RESET
- Uses `useShips` hook for paginated API data fetching
- Reuses Phase 5 components: `ShipFilterPanel`, `ShipSearchBar`, `ShipCard`
- 3-column responsive grid layout (1/2/3 columns at sm/lg breakpoints)
- Instant-select behavior: clicking a ship calls `onSelect(ship)` then `onClose()`
- Framer Motion animations: backdrop fade + modal scale (0.95 -> 1)
- Body scroll lock while modal is open
- State resets on close for clean reopening
- Skeleton grid (6 cards) during loading, empty state message
- Simple prev/next pagination with "Page X of Y" display

### Task 2: Rewire UserFleetBuilder and UserFleetBuilderWrapper (2e43315)

**UserFleetBuilder.tsx** -- Full rewrite:
- Removed all imports from `@/types/ShipData` (`getManufacturersList`, `getShipsByManufacturer`)
- Removed `resolveShipImageLegacy` import
- Added: `FleetShipPickerModal`, `shipDocumentToUserShip`, `resolveShipImage`, `ShipDocument` type
- New prop: `resolvedShips: Map<string, ShipDocument>` for batch-resolved ship data
- Replaced manufacturer/ship dropdown UI with single "ADD SHIP" button + FleetShipPickerModal
- Ship display: looks up resolved data via `resolvedShips.get(ship.fleetyardsId)`
  - If resolved: shows FleetYards CDN image (angled view), manufacturer logo (16px), crew, size, classification
  - If not resolved (empty fleetyardsId): shows name and manufacturer only, "No image available" placeholder
- Removed: `selectedManufacturer`, `selectedShip`, `manufacturers`, `availableShips`, `selectStyles` state

**UserFleetBuilderWrapper.tsx** -- Batch resolution integration:
- Removed `getManufacturersList`, `getShipsByManufacturer` imports from `../types/ShipData`
- Added `useShipBatch` from `@/hooks/useShipBatch` and `useMemo` to React imports
- Added batch resolution: `useMemo` extracts fleetyardsIds, `useShipBatch` resolves them
- Passes `resolvedShips` map to `UserFleetBuilder`

**UserProfilePanel.tsx** -- Additional caller fix (Rule 3 - Blocking):
- Also uses `UserFleetBuilder` directly (not via Wrapper) -- needed the same `resolvedShips` prop
- Added `useMemo`, `useShipBatch` imports
- Added batch resolution before early return (hooks must be unconditional)
- Passes `resolvedShips` to `UserFleetBuilder`

## Decisions Made

- [06-02]: FleetShipPickerModal uses pageSize 12 (smaller grid than browse page's 24 to fit modal viewport)
- [06-02]: Modal state resets on close via RESET action (clean filter state each time modal opens)
- [06-02]: Angled view image preferred for fleet display (larger cards benefit from angled perspective)
- [06-02]: Unresolved ships show "No image available" placeholder div instead of placeholder image (explicit fallback)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed UserProfilePanel missing resolvedShips prop**
- **Found during:** Task 2 type-check
- **Issue:** UserProfilePanel.tsx also renders UserFleetBuilder directly (not via Wrapper) and was missing the new required `resolvedShips` prop
- **Fix:** Added `useShipBatch` hook, `useMemo` for fleetyardsIds extraction, and `resolvedShips` prop pass-through
- **Files modified:** src/components/UserProfilePanel.tsx
- **Commit:** 2e43315

## Verification

- `npm run type-check` passes with zero errors (run after each task and at final)
- `FleetShipPickerModal.tsx` exists and exports `FleetShipPickerModal` (default export)
- `UserFleetBuilder.tsx` has zero imports from `@/types/ShipData` or `@/lib/ship-data`
- `UserFleetBuilderWrapper.tsx` has zero imports from `../types/ShipData`
- `UserFleetBuilder.tsx` uses `resolvedShips` map for image display
- `UserFleetBuilderWrapper.tsx` calls `useShipBatch`
- `UserProfilePanel.tsx` calls `useShipBatch` and passes `resolvedShips`

## Next Phase Readiness

Fleet builder is fully rewired. No blockers for downstream plans:
- **Plan 03** (MissionPlanner): Can proceed with mission planner rewire
- **Plan 04** (Fleet Operations): Can proceed with operations page rewire
- **Plan 05** (Fleet Analytics): Can proceed with org fleet analytics
