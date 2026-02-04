# Phase 5: Ship Browse & Display - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a ship browsing UI where users can search, filter, and inspect the full ship database. Delivers: multi-axis filtering (manufacturer, size, role, production status), text search, ship cards with grid/list toggle, a slide-out detail panel with specs and multi-angle images, pagination, and a data freshness indicator. Creating/editing ships, fleet integration, and mission planner wiring are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Ship Card Design
- Toggle between card grid and compact list views (user-switchable)
- Card grid: image-heavy responsive grid; list view: horizontal rows with small thumbnails
- Minimal info on cards in both views: ship name, store image, manufacturer, role/classification
- Same info shown in both grid and list layouts (list is same data, row format)
- Default card image: store image angle
- All UI components must align with the existing MobiGlas site theme

### Filter & Search UX
- Collapsible filter panel (toggles open/closed to maximize browse space)
- Active filters shown as removable chips/tags above results when panel is collapsed
- Text search is additive (AND) with category filters — search narrows within active filter selections
- Filter state is session-only (not persisted in URL, resets on page reload)

### Ship Detail View
- Slide-out panel from right side (not a new page or modal) — preserves browse context
- Information hierarchy: ship name and manufacturer header at top, image to the side, specs below
- Image gallery: main large image with thumbnail strip below (angled, side, top, store angles)
- Click thumbnail to swap main image
- Ship description from FleetYards shown in a collapsible/expandable section (specs visible by default)

### Pagination & Result Count
- Traditional pagination with page numbers (not infinite scroll or load-more)
- Result count displayed with range: "Showing 1-24 of 537 ships"

### Data Freshness
- Subtle footer text showing last sync time: "Last synced: 2 hours ago"

### Claude's Discretion
- Empty state design when filters return no results (message + clear filters approach)
- Loading skeleton/spinner design
- Exact spacing, typography, and visual details within MobiGlas theme constraints
- Page size (items per page) for pagination
- Thumbnail strip layout and sizing within the slide-out panel

</decisions>

<specifics>
## Specific Ideas

- User stressed that all UI components must align with the existing MobiGlas theme — this is a hard constraint, not a suggestion
- Grid/list toggle should feel natural within the existing site design language
- Slide-out panel chosen specifically to preserve browse context while inspecting ships

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-ship-browse-and-display*
*Context gathered: 2026-02-03*
