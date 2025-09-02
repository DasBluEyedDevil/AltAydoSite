# Mission Builder Consolidation — Single-Screen Composer

Date: 2025-09-02

Overview
- Replaced the multi-step Mission Builder and Finalize flow with a single modal screen, Mission Composer, featuring four collapsible sections: Overview, Personnel, Vessels, Review.
- Preserved existing mission fields, participant mapping, holographic look/feel (Tailwind + Holo components), and API/storage semantics.
- Improved accessibility with labeled controls and focus hints. Reduced clicks by making all interactions inline.

Before vs After
- Before: Multi-step tabs with a Finalize Assignments gating step; save was blocked until finalize.
- After: One pop-up modal (HoloModal) with a sticky header and a scrollable body; save is enabled when canSave is true (computed validity). No Finalize button/step.

Key Components
- MissionComposerModal (src/components/fleet-ops/mission-planner/MissionComposerModal.tsx)
  - Wraps HoloModal and renders header CTAs (SAVE/CLOSE) with a status chip.
  - Receives validity/status from child via onState callback.
- MissionComposer (src/components/fleet-ops/mission-planner/MissionComposer.tsx)
  - Single-screen accordion: Overview → Personnel → Vessels → Review.
  - Inline role selection and Ground Support toggle; inline vessel crew tally and reassignment.
  - Participant mapping extracted to prepareParticipants; unified canSave predicate.

Validation and canSave Definition
- hasOverview: name, type, scheduledDateTime present.
- shipsOk: for each selected vessel, current crew assigned does not exceed its crewRequirement (underflow allowed; extensible).
- canSave = hasOverview && shipsOk.
- Section headers show badges with error counts; save attempts scroll to first invalid field and auto-open the relevant section.

Accessibility
- Inputs have explicit labels, ids, and aria-invalid on required fields.
- When the modal opens, focus is placed on the first invalid field or Mission Name.
- Section headers are buttons with clear focus styles and tracking-wider titles.

Opening the Composer
- Dashboard: Create Mission opens MissionComposerModal.
- Mission List/Card: clicking a mission opens MissionComposerModal populated with that mission.

Participant Mapping (unchanged contract)
For each selected user, we emit a MissionParticipant with:
- userId, userName
- shipId, shipName, shipType, manufacturer, image, crewRequirement (when assigned)
- isGroundSupport flag (true when assigned to ground support)
- roles: single-element array using the inline role picker

Extension Points
- Roles: extend the inline role input to use a dropdown or preset roles.
- Strict crew rules: tighten canSave to enforce minimum crew or mandatory assignment for all selected users.
- Section composition: add more sections or split Review details as needed.

Screenshots (to add)
- Include before/after screenshots showing fewer clicks and the single-screen modal layout.

File Changes Summary
- Added: MissionComposerModal.tsx, MissionComposer.tsx, docs/mission-builder/consolidation.md
- Updated: page.tsx to wire new modal and open from card clicks.
- Left in place but unused: legacy MissionForm (no longer referenced from the dashboard UI).
