---
phase: 06-frontend-integration
plan: 04
subsystem: profile-and-mission-ship-display
tags: [profile-ships, mission-roster, batch-resolution, FleetYards-CDN, inline-expand]
completed: 2026-02-04
duration: ~4 min

dependency-graph:
  requires: [phase-02-ship-api, phase-04-type-system, 06-01]
  provides: [ProfileShipCard-component, MissionParticipantShip-component, profile-fleet-display, mission-participant-ship-display]
  affects: [06-05]

tech-stack:
  added: []
  patterns: [batch-ship-resolution, inline-expand-detail, contextual-specs]

key-files:
  created:
    - src/components/ships/ProfileShipCard.tsx
    - src/components/ships/MissionParticipantShip.tsx
  modified:
    - src/components/profile/UserProfileContent.tsx
    - src/components/fleet-ops/mission-planner/MissionDetail.tsx
---

# Phase 6 Plan 04: Profile Ship Display and Mission Participant Ships Summary

ProfileShipCard with FleetYards CDN images and inline expand detail, MissionParticipantShip with contextual specs for multi-crew/transport ships, both wired via useShipBatch batch resolution.

## What Was Done

### Task 1: Create ProfileShipCard and MissionParticipantShip components (7962ed1)

**ProfileShipCard** (`src/components/ships/ProfileShipCard.tsx`):
- Compact horizontal card (h-24) with 80x60px thumbnail from `resolveShipImage(resolved.images, 'store')`
- Ship name, manufacturer name with 14px logo from resolved.manufacturer.logo
- Right side: size badge (formatSize) and classificationLabel
- Click toggles inline expand via useState + framer-motion AnimatePresence
- Expanded section shows: crew (formatCrew), cargo (formatCargo), speed (formatSpeed), description (200 char truncation), production status badge
- Unresolved ships: show name and manufacturer from UserShip data, no image, no expand functionality
- Image error handling via useState (onError sets imgError flag, same pattern as ShipCard)

**MissionParticipantShip** (`src/components/ships/MissionParticipantShip.tsx`):
- Thumbnail-style display: 48x32px image for resolved ships, avatar circle fallback for unresolved
- Participant userName always visible, role badges from participant.roles array
- Resolved ships show: ship name (font-quantify), size badge, classificationLabel
- Unresolved ships with shipName: show ship name text with lightning bolt icon, no image, no placeholder (locked decision)
- INT-05 contextual specs: crew shown when crew.max > 1, cargo shown for transport/freight/hauling classifications
- MobiGlas styling with mg-panel-dark, mg-primary borders, mg-text colors

### Task 2: Rewire UserProfileContent and MissionDetail (b7ca871)

**UserProfileContent.tsx:**
- Added imports: useShipBatch, ProfileShipCard, useMemo
- Batch resolution: `useMemo` extracts fleetyardsIds from userShips, `useShipBatch` resolves them
- New "MY FLEET" read-only section rendered below fleet builder wrapper when NOT editing
- Shows all ships at once (no pagination -- locked decision)
- Loading state: animated skeleton placeholders matching ship count
- Empty state: "No ships in fleet" centered text
- Each ship rendered as `<ProfileShipCard ship={ship} resolved={resolvedShips.get(ship.fleetyardsId)} />`

**MissionDetail.tsx:**
- Added imports: useShipBatch, MissionParticipantShip, useMemo
- Batch resolution: `useMemo` extracts fleetyardsIds from mission.participants, `useShipBatch` resolves them
- Replaced inline participant rendering with `<MissionParticipantShip>` component
- Preserved all existing framer-motion animation variants (stagger entrance, hover effects, scanning lines)
- Preserved "No personnel assigned" empty state
- All participants always visible regardless of count (locked decision)

## Decisions Made

- [06-04]: Profile fleet is read-only (no add/remove on profile page, fleet management in fleet builder edit mode)
- [06-04]: Unresolved mission participant ships show name/role text with lightning bolt icon, no image or placeholder
- [06-04]: INT-05 contextual specs: crew for multi-crew ships (crew.max > 1), cargo for transport/freight/hauling classification

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `npm run type-check` passes with zero errors
- `ProfileShipCard.tsx` exists and exports `ProfileShipCard` (default export)
- `MissionParticipantShip.tsx` exists and exports `MissionParticipantShip` (default export)
- `UserProfileContent.tsx` imports and uses `useShipBatch` and `ProfileShipCard`
- `MissionDetail.tsx` imports and uses `useShipBatch` and `MissionParticipantShip`
- No placeholder images shown for unresolved ships in mission detail (graceful text-only fallback)

## Next Phase Readiness

Plan 04 deliverables are complete. Remaining in Phase 6:
- **Plan 05** (Fleet Analytics): Can use `useOrgFleet` hook and recharts (independent of this plan)

No blockers for downstream plans.
