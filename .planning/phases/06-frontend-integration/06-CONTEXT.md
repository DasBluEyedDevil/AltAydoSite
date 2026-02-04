# Phase 6: Frontend Integration - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewire all existing application features (fleet builder, mission planner, user profiles) to use the dynamic ship API (`/api/ships`) instead of static ship data. Build a new org fleet composition dashboard showing aggregate fleet breakdown. Ship images come from FleetYards CDN. No new features beyond what's specified in INT-01 through INT-06.

</domain>

<decisions>
## Implementation Decisions

### Ship Picker UX
- Modal picker with full filter panel (manufacturer, size, role) plus search — opens as a dialog, similar to browse page but scoped to selection
- Instant select — clicking a ship immediately selects it and closes the modal, no preview/confirm step
- Separate picker components for fleet builder and mission planner — each tailored to its context rather than a shared component
- Light visual refresh — swap data source AND update ship display to show FleetYards images, manufacturer logos, and specs, but keep overall page layouts intact

### Profile Ship Display
- Ship cards with images — card layout showing FleetYards ship image, manufacturer logo, name, and key specs (size, role)
- Inline detail expand — clicking a ship card expands it in place on the profile page to show more details without navigating away
- Show all ships at once — no progressive loading or pagination, load every ship the user owns
- View only on profile — no add/remove capability; fleet management happens exclusively in the fleet builder

### Mission View Ship Rendering
- Unresolved ships hidden gracefully — if a participant's ship can't be resolved, don't show a ship image or placeholder, just show participant name and role
- Include role and size class alongside ship name and image — provides tactical context for mission participants
- All participants always visible — no collapsing or thresholds regardless of participant count

### Claude's Discretion
- Mission participant ship display style (thumbnail vs card) — choose based on current mission detail layout and space constraints
- Exact image sizes and spacing across all rewired components
- Loading states and skeleton patterns during API calls
- Error handling for failed ship data fetches in each context

### Fleet Composition Dashboard
- Dedicated page at its own route — standalone view, not a section on an existing page
- Multi-axis with tabs — three views: by role/classification, by manufacturer, by size class, switchable via tabs
- Charts and numbers visualization — bar/pie charts showing distribution with counts and percentages
- Drill-down detail — category totals shown by default, expandable to reveal individual ship models with counts within each category

</decisions>

<specifics>
## Specific Ideas

- Ship picker modals should feel like the browse page filter experience — familiar to users who've already used ship browsing
- Fleet composition charts should communicate at a glance what the org's fleet strengths and gaps are
- Profile ship cards should be smaller than browse page cards — they're secondary content on the profile, not the main event

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-frontend-integration*
*Context gathered: 2026-02-03*
