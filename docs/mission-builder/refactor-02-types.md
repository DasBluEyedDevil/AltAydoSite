# Stage 2 — Types & Validation (Mission Builder)

Date: 2025-09-02
Author: Junie (agent)

## Overview
This stage introduces strongly-typed, builder-scoped models and Zod validation for the Mission Builder, without altering existing behavior, routes, or APIs.

New files:
- src/types/mission-builder.ts — Types scoped to the builder flow to avoid any conflicts with the existing src/types/Mission.ts used by current pages and APIs.
- src/lib/mission-builder/validation.ts — Zod schemas paralleling the builder types and helpers for validation/field error mapping.
- src/lib/mission-builder/store.tsx — Local, page-scoped reducer store (not wired into UI yet) to centralize mission-draft state.
- src/lib/mission-builder/selectors.ts — Derived selectors for summary/validity/errors.

## Types (src/types/mission-builder.ts)
- BuilderMissionStatus, BuilderMissionType — Mirrors current status/type values used in Mission.ts.
- MissionParticipantDraft — Optional fields during drafting (roles optional, ship fields optional, etc.).
- MissionDraft — Canonical builder model (id optional; timestamps optional; includes images, participants, optional waypoints/rewards for future expansion).
- Waypoint, Reward — Reserved for future stages; unused for now.

Design choices:
- Namespaced with "builder" to avoid collisions with existing Mission.ts.
- Field names align with current Mission API shapes, easing future mapping.

## Validation (src/lib/mission-builder/validation.ts)
- Zod schemas for MissionDraft, ParticipantDraft, Waypoint, Reward.
- missionStatusValues and missionTypeValues match the app’s existing values.
- validateMissionDraft(data) returns either {success:true, data} or {success:false, errors: FieldErrors}.
- isMissionDraftValid(data) and coerceToMissionDraft(data) utilities included.

## Store & Selectors
- store.tsx: React context + reducer with actions (setField, add/remove image, manage participants, reset, load, validate, save placeholder).
- selectors.ts: compute participantCount, shipCount, groundSupportCount, validity, and error map.
- Purposefully not wired into UI yet to prevent behavior changes.

## Compatibility
- No changes to src/types/Mission.ts or API/storage layers.
- Values for status/type mirror the existing enums; any future adapters can map MissionDraft <-> MissionResponse as needed.

## Usage Guidance (when extraction begins)
- Wrap Mission Builder page with <MissionBuilderProvider> and pass an initial mission draft if editing.
- Use useMissionBuilder() from store.tsx to read/update state.
- Validate on submit with actions.validate() and surface errors in panels.

## Future Work
- Add adapters (mapper functions) to convert between MissionDraft and MissionResponse (API shape) once wiring is introduced.
- Extract MissionForm into panels (Header, Personnel, Vessels, Images, Validation Summary, Summary) and connect to the store.
- Optional: Add autosave with debounce using existing API route while keeping hybrid storage semantics intact.
