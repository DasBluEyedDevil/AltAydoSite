---
phase: 04-type-system-image-resolution
plan: 01
subsystem: types
tags: [typescript, types, fleetyardsId, next-config, cdn, image-resolution]
requires:
  - phase-03 (fleetyardsId written into MongoDB data by migration)
provides:
  - TypeScript types with fleetyardsId across UserShip, MissionShip, MissionParticipant, OperationParticipant, MissionParticipantDraft
  - next.config.js at project root with FleetYards CDN in remotePatterns
affects:
  - phase-04-02 (image resolution helper and API validation)
  - phase-05 (ship browse UI will use fleetyardsId types)
  - phase-06 (frontend integration depends on these types)
  - phase-07 (cleanup removes image field marked optional here)
tech-stack:
  added: []
  patterns:
    - Additive type migration with optional image for transition period
    - Placeholder fleetyardsId in helper functions with caller-must-set pattern
key-files:
  created:
    - next.config.js
  modified:
    - src/types/user.ts
    - src/types/PlannedMission.ts
    - src/types/Mission.ts
    - src/types/Operation.ts
    - src/types/mission-builder.ts
    - src/app/api/profile/route.ts
    - src/components/UserFleetBuilder.tsx
    - src/components/dashboard/MissionPlanner.tsx
    - src/components/dashboard/MissionPlannerForm.tsx
key-decisions:
  - "image made optional (not removed) to avoid breaking ~7 component files -- deferred to Phase 7"
  - "shipDetailsToMissionShip sets fleetyardsId to empty string with caller-must-set comment"
  - "Downstream type errors fixed inline: profile route Zod schema, UserFleetBuilder, MissionPlanner/Form image fallbacks"
patterns-established:
  - "Transition pattern: add new required field + make old field optional, fix downstream immediately"
duration: ~3 min
completed: 2026-02-04
---

# Phase 4 Plan 01: Type Definitions & next.config.js Summary

**One-liner:** Added fleetyardsId to all 5 ship-referencing types (required for UserShip/MissionShip, optional for participants), made image optional for transition, restored next.config.js with FleetYards CDN.

## Performance

- Duration: ~3 minutes
- 2 tasks, 2 commits
- 9 files changed (5 type files + 4 downstream fixes + 1 new config)

## Accomplishments

1. **Type definitions updated** -- fleetyardsId added to UserShip (required), MissionShip (required), MissionParticipant (optional), OperationParticipant (optional), MissionParticipantDraft (optional)
2. **Image field made optional** -- UserShip.image and MissionShip.image changed from required to optional with Phase 7 removal comment
3. **next.config.js restored** -- Recreated at project root from scripts/next.config.js with cdn.fleetyards.net/uploads/** as first remotePatterns entry
4. **Downstream type errors fixed** -- Profile route Zod schema, UserFleetBuilder constructor, MissionPlanner/Form image src fallbacks

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add fleetyardsId to all ship-referencing types | 4b2bf25 | src/types/{user,PlannedMission,Mission,Operation,mission-builder}.ts + 4 downstream fixes |
| 2 | Restore next.config.js with FleetYards CDN | 411e9b6 | next.config.js |

## Files Changed

### Created
- `next.config.js` -- Project root config with FleetYards CDN, webpack discord.js externals, redirects, security headers

### Modified
- `src/types/user.ts` -- UserShip: +fleetyardsId (required), image now optional
- `src/types/PlannedMission.ts` -- MissionShip: +fleetyardsId (required), image now optional; shipDetailsToMissionShip: +fleetyardsId placeholder
- `src/types/Mission.ts` -- MissionParticipant: +fleetyardsId (optional)
- `src/types/Operation.ts` -- OperationParticipant: +fleetyardsId (optional)
- `src/types/mission-builder.ts` -- MissionParticipantDraft: +fleetyardsId (optional)
- `src/app/api/profile/route.ts` -- Zod userShipSchema: +fleetyardsId, image optional
- `src/components/UserFleetBuilder.tsx` -- onAddShip call: +fleetyardsId placeholder
- `src/components/dashboard/MissionPlanner.tsx` -- Image src fallback for optional image (2 locations)
- `src/components/dashboard/MissionPlannerForm.tsx` -- Image src fallback for optional image

## Decisions Made

1. **Image optional, not removed** -- Changing image to optional (not deleting) avoids breaking ~7 components that still reference ship.image. These get rewired in Phases 5-6 and the field is removed in Phase 7.
2. **shipDetailsToMissionShip placeholder** -- The ShipDetails type lacks fleetyardsId, so the helper sets `fleetyardsId: ''` with a comment that callers must populate it. This prevents silent creation of ships without FleetYards references.
3. **Downstream fixes included in Task 1** -- Rather than leaving type errors for a separate task, fixed the 4 downstream files (profile route, fleet builder, mission planner components) that broke due to the new required field and optional image. This keeps `npm run type-check` green at every commit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed profile route Zod schema for fleetyardsId**
- **Found during:** Task 1 type-check verification
- **Issue:** `userShipSchema` in `src/app/api/profile/route.ts` did not include `fleetyardsId` and had `image` as required, causing TS2345
- **Fix:** Added `fleetyardsId: z.string()` and changed `image` to `z.string().optional()`
- **Files modified:** src/app/api/profile/route.ts
- **Commit:** 4b2bf25

**2. [Rule 3 - Blocking] Fixed UserFleetBuilder missing fleetyardsId**
- **Found during:** Task 1 type-check verification
- **Issue:** `onAddShip()` call constructed UserShip without fleetyardsId, causing TS2345
- **Fix:** Added `fleetyardsId: ''` with TODO comment for Phase 5
- **Files modified:** src/components/UserFleetBuilder.tsx
- **Commit:** 4b2bf25

**3. [Rule 3 - Blocking] Fixed MissionPlanner/Form optional image src**
- **Found during:** Task 1 type-check verification
- **Issue:** `<Image src={ship.image}>` now gets `string | undefined` since image is optional, causing TS2322
- **Fix:** Added fallback: `ship.image || '/images/placeholder-ship.png'` at 3 locations
- **Files modified:** src/components/dashboard/MissionPlanner.tsx, src/components/dashboard/MissionPlannerForm.tsx
- **Commit:** 4b2bf25

## Issues & Risks

- **Placeholder fleetyardsId in UserFleetBuilder** -- The fleet builder currently sets `fleetyardsId: ''` when adding ships. This is fine for the transition period but Phase 6 must wire it to the ship API lookup to populate the real UUID.
- **Placeholder image path** -- `/images/placeholder-ship.png` is used as fallback but may not exist yet. Phase 5 should create this asset or use a different fallback strategy.

## Next Phase Readiness

Plan 04-02 (Image Resolution) is unblocked:
- All types now have fleetyardsId fields
- next.config.js is in place with FleetYards CDN support
- `npm run type-check` passes cleanly
- Ready for resolveShipImage() helper and API validation updates
