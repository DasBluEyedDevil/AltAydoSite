# Refactor Inventory — Mission Builder (aka Mission Planner)

Repo: AltAydoSite (Next.js 15, App Router, Tailwind, NextAuth)
Date: 2025-09-02
Author: Junie (agent)

## Summary
The “Mission Builder” functionality in this repo is implemented as a Fleet Ops Mission Planner. The primary route is the mission database page under the dashboard. It composes a dashboard list, a detail view, and a large mission form shown inside modals. Data is fetched via an authenticated API and stored through a hybrid storage layer (MongoDB/Cosmos primary with JSON file fallback).

- Route (App Router):
  - src/app/dashboard/operations/missions/page.tsx
- Components (Planner):
  - src/components/fleet-ops/mission-planner/MissionDashboard.tsx
  - src/components/fleet-ops/mission-planner/MissionList.tsx
  - src/components/fleet-ops/mission-planner/MissionCard.tsx
  - src/components/fleet-ops/mission-planner/MissionDetail.tsx
  - src/components/fleet-ops/mission-planner/MissionForm.tsx
  - src/components/fleet-ops/mission-planner/MissionFilters.tsx
  - src/components/fleet-ops/mission-planner/HoloModal.tsx
- Types:
  - src/types/Mission.ts (Mission, MissionResponse, MissionParticipant, MissionStatus, MissionType)
- API:
  - src/app/api/fleet-ops/missions/route.ts (GET, POST, PUT, DELETE)
- Storage (hybrid):
  - src/lib/mission-storage.ts (MongoDB primary + local JSON fallback)

## Component Tree (approx.)

MissionDatabasePage (client)
- MissionDashboard
  - MissionFilters
  - MissionList
    - MissionCard (per mission)
  - HolographicButton (Create)
- HoloModal (Detail)
  - MissionDetail
- HoloModal (Form)
  - MissionForm
- HoloModal (Delete Confirm)

## Page: MissionDatabasePage

Imports: useSession (NextAuth), framer-motion, types, components, HoloModal.

State:
- missions: MissionResponse[]
- loading: boolean
- error: string | null
- selectedMission: MissionResponse | null
- isFormOpen: boolean (unused in current flow; showFormModal used instead)
- editingMission: MissionResponse | null
- isInitialized: boolean (delayed init effect)
- viewMode: 'list' | 'detail' | 'form' (UI state; modals govern actual presentation)
- showDetailModal: boolean
- showFormModal: boolean
- showDeleteConfirmModal: boolean
- missionToDelete: string | null
- systemMessage: string | null (auto-cleared after 5s)

Effects & Side Effects:
- System message timeout cleanup.
- Simulated initialization setTimeout.
- Fetch missions on authenticated session: GET /api/fleet-ops/missions.

Event Handlers:
- handleMissionClick(mission) -> open detail modal.
- handleBack() -> close modals, clear selections.
- handleCreateMission() -> open form modal for new mission.
- handleEditMission(mission) -> transition detail->form.
- handleConfirmDelete(id) -> open delete modal.
- handleSaveMission(mission) -> if existing PUT /api/fleet-ops/missions, else POST; update local state; set systemMessage.
- handleDeleteMission() -> DELETE /api/fleet-ops/missions?id=...; update local state; set systemMessage.

Presentational Concerns:
- Tailwind classes with custom CSS variables (--mg-primary, --mg-panel-dark).
- Animated transitions (framer-motion).

## Components

MissionDashboard
- Props: missions, loading, onMissionClick, onCreateMission.
- Internal state: statusFilter (MissionStatus|'all'), typeFilter (MissionType|'all'), sortOrder ('asc'|'desc'), hover state.
- Renders MissionFilters and MissionList; applies client-side filter/sort.

MissionList
- Props: missions, onMissionClick, loading?, error?
- Shows elaborate loading visuals; renders list of MissionCard.

MissionCard
- Props: mission (MissionResponse)
- Displays mission metadata and action affordances (click to view).

MissionDetail
- Props: mission, onBack, onEdit, onDelete
- Renders read-only mission details; Tailwind + motion; status badge styling helper.

MissionForm (Large, stateful)
- Props: mission?, onSave, onCancel, onDelete?
- Internal state:
  - activeTab: 'basic' | 'personnel' | 'vessels'
  - formData: Partial<MissionResponse>
  - users: User[] (fetched from /api/users)
  - selectedUsers: User[]
  - searchTerm: string
  - loading: boolean
  - crewAssignments: CrewAssignment[]
  - selectedShips: UserShip[]
  - statusMessage: {type, text, shipId}
  - assignmentsFinalized: boolean
  - imageUploadUrl: string
- Derived:
  - unassignedCrew, getShipCrew, groundSupportCrew
- Effects:
  - Synchronize form state with incoming mission
  - Fetch users from /api/users and transform ship data using ShipData helpers
- Emits:
  - onSave(form as MissionResponse)
  - onCancel()
  - onDelete(id)

HoloModal
- Generic modal shell component with holographic styling used for detail, form, and delete-confirm flows.

## Data Layer

API: src/app/api/fleet-ops/missions/route.ts
- Auth: getServerSession(authOptions) -> 401 if not authenticated.
- GET: lists missions (filters: status, leaderId); paginates; returns {items, page, pageSize, total, totalPages}.
- POST: basic validation; create via missionStorage.createMission; returns created mission.
- PUT: validates; update via missionStorage.updateMission.
- DELETE: requires id param; missionStorage.deleteMission; returns success + storage mode info.

Storage: src/lib/mission-storage.ts
- MongoDB/Cosmos via connectToDatabase(); collection('missions').
- Local fallback JSON file at data/missions.json, with ensureDataDir(), getLocalMissions(), saveLocalMission(), deleteLocalMission().
- Exposed fns (non-exhaustive): getAllMissions(filters), getMissionById(id), createMission(data), updateMission(id, data), deleteMission(id), isUsingFallbackStorage().

## Current Validation & Auth
- API validation is ad-hoc (string checks). No Zod schema on client or server yet.
- NextAuth guards on API; page uses useSession to gate fetch but does not render an auth wall itself.

## URL/Query Params & Persistence
- Page does not manage URL query params for filters or selection; state is purely in-memory.
- No autosave; explicit save through modal form.

## Gaps / Risks
- MissionForm is monolithic and stateful, mixing data fetch, transformation, and UI.
- No centralized state/store; page and form share separate states and patterns.
- Validation is minimal; client relies on alert + inline checks.
- No tests around store/storage adapters.

## Baseline Snapshot
- Behavior verified by reading code: two-modal flow (detail/form), list dashboard with filters and create button, CRUD through API, hybrid storage.
- Styling through Tailwind preserved.

## Next Steps
1) Draft component decomposition plan (layout + panels + atoms) to extract MissionForm sections and modal shells while preserving behavior and Tailwind classes.
2) Introduce mission-builder-scoped types and Zod validation that mirror existing shapes without affecting current types.
3) Add a local store (context + reducer) to centralize mission-draft editing for future extraction; do not wire it yet.
