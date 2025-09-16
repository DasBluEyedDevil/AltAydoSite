# Refactor Plan — Mission Builder (Mission Planner)

Repo: AltAydoSite (Next.js 15 App Router, Tailwind, NextAuth)
Date: 2025-09-02
Author: Junie (agent)

This plan componentizes the existing Mission Planner (“Mission Builder”) without changing behavior or styling. It aligns with App Router and the current hybrid storage (Mongo/Cosmos primary with local JSON fallback).

## Target Component Hierarchy

- MissionBuilderLayout (composition shell)
  - header: MissionHeaderForm (title, type, schedule, status, leader)
  - leftPanels:
    - ObjectiveListPanel (optional future use if objectives added)
    - PersonnelPanel (user selection, roles, ground support)
    - VesselsPanel (ship selector, assignments, crew by ship)
  - rightPanels (sidebar):
    - ImagesPanel (upload/add by URL)
    - RulesValidationPanel (inline errors, Zod summary)
    - MissionSummaryPanel (key facts, counts, timestamps)
  - tooling:
    - SaveStatusChip
    - PresetTemplatesModal (future; not wired now)
    - ImportExportDialog (future; preserve formats)
    - DeleteConfirmDialog

- Atoms/Utilities (reusable):
  - FieldRow, TextField, SelectField, DateTimeField, NumberField
  - TagList, Badge, EmptyState

- Modals:
  - HoloModal (existing, reused)
  - Detail view remains in MissionDetail (existing)

Note: MissionDashboard, MissionList, MissionCard, MissionDetail remain as-is. MissionForm will be split progressively into the panels above.

## State Ownership

- Canonical mission draft state: MissionBuilderProvider (local context + reducer) in src/lib/mission-builder/store.tsx.
  - State shape: { mission: MissionDraft, status: 'idle'|'saving'|'saved'|'error', dirty: boolean, errors?: Record<string,string> }
  - Actions: setField, add/remove image, manage participants, manage vessels/assignments, reset, loadFrom(mission), save() (wired via api wrapper later).
- Presentational components are controlled via props derived from selectors (src/lib/mission-builder/selectors.ts).
- Components may have trivial internal UI state (e.g., which tab is open), but no business data duplication.

## Props and Events (contracts excerpt)

- MissionHeaderForm
  - props: { value: Pick<MissionDraft,'name'|'type'|'scheduledDateTime'|'status'|'leaderId'|'leaderName'>, errors?: FieldErrors }
  - emits: onChange(partial: Partial<MissionDraft>)

- PersonnelPanel
  - props: { users: User[], assignments: CrewAssignment[], unassigned: User[] }
  - emits: onAddUser(userId), onRemoveUser(userId), onAssignCrew(payload), onUnassignCrew(userId)

- VesselsPanel
  - props: { selectedShips: UserShip[], crewByShip: Record<shipId, CrewAssignment[]> }
  - emits: onAddShip(shipId), onRemoveShip(shipId)

- ImagesPanel
  - props: { images: string[] }
  - emits: onAddImage(url), onRemoveImage(url)

- RulesValidationPanel
  - props: { issues: ValidationIssue[] }

- MissionSummaryPanel
  - props: { derived: { participantCount, shipCount, groundSupportCount }, timestamps }

- SaveStatusChip
  - props: { status: 'idle'|'saving'|'saved'|'error' }

## Types (first pass)

A builder-scoped types module avoids collision with existing src/types/Mission.ts.

File: src/types/mission-builder.ts
- ObjectiveType = 'fetch'|'deliver'|'destroy'|'scan'|'escort' (future)
- Objective discriminated unions (future)
- Waypoint: { id, system, x, y, z, note? }
- Reward: { credits?, rep?, items? }
- MissionDraft: { id?, name, type, scheduledDateTime, status, briefSummary, details, location?, leaderId?, leaderName?, images: string[], participants: MissionParticipantDraft[], createdAt?, updatedAt? }
- MissionParticipantDraft mirrors MissionParticipant from existing types with optional fields during drafting.

Validation with Zod in src/lib/mission-builder/validation.ts, producing readable error maps.

## Server/Data Boundaries

- No changes to existing API endpoints now. A client wrapper can be added under src/lib/mission/api.ts later to centralize I/O (using /api/fleet-ops/missions and preserving fallback semantics handled by mission-storage.ts and API route).

## Migration/Extraction Strategy

1) Land types, validators, and store (no usage) to de-risk compile.
2) Extract least-coupled pieces from MissionForm first:
   - MissionHeaderForm
   - ImagesPanel
   - SaveStatusChip
3) Next, split PersonnelPanel and VesselsPanel while reusing existing transformation helpers (ShipData utilities) and props/callbacks.
4) Keep HoloModal and MissionDetail untouched for now.
5) After extraction, wire panels to MissionBuilderProvider on the page, replacing local state in MissionForm gradually.

## Acceptance Criteria for this Phase

- Build remains green.
- No route or API behavior changes.
- Styles and classNames preserved when extraction starts.
- New files: docs/mission-builder/*, src/types/mission-builder.ts, src/lib/mission-builder/{validation.ts,store.tsx,selectors.ts} compiled with no unused import errors.
