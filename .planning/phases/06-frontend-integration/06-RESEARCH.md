# Phase 6: Frontend Integration - Research

**Researched:** 2026-02-04
**Domain:** React component rewiring, modal picker UI, charting, ship API integration
**Confidence:** HIGH

## Summary

Phase 6 rewires four existing features (fleet builder, mission planner form, mission detail view, user profile) to use the dynamic ship API (`/api/ships`) instead of static `ShipData.ts` / `loadShipDatabase()`. It also builds a new org fleet composition dashboard with charts. The existing codebase provides an excellent foundation: hooks (`useShips`, `useShipDetail`), components (`ShipCard`, `ShipFilterPanel`, `ShipSearchBar`), format utilities (`formatCrew`, `formatCargo`, `formatSpeed`), and image resolution (`resolveShipImage`) are all production-ready from Phase 5.

The primary technical challenge is building two separate modal ship pickers (one for fleet builder, one for mission planner) that embed the same filter/search/select pattern from the browse page but scoped to selection context. The fleet composition dashboard requires a charting library -- Recharts is the recommended choice because it is React-native with a JSX API, well-suited for the bar/pie charts needed, and this project already uses React 18 + Next.js 15.

**Primary recommendation:** Reuse Phase 5 hooks and components extensively. Build modal pickers as new components that compose existing `ShipFilterPanel` + `ShipSearchBar` + `ShipCard` patterns. Use Recharts for the dashboard. Batch-resolve user fleet ships via `POST /api/ships/batch`.

## Standard Stack

### Core (Already in Project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | ^18 | UI framework | Already in project |
| Next.js | 15.3.3 | App framework | Already in project |
| framer-motion | ^10.16.4 | Animations/modals | Already used for existing modal (ShipDropdownPortal) |
| @heroicons/react | ^2.1.1 | Icons | Already used in ShipFilterPanel, ShipSearchBar |
| next/image | (bundled) | Optimized images | Already configured with FleetYards CDN remote patterns |

### New Addition Required

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | ^2.15 | Charts for fleet composition dashboard | INT-06 only |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | chart.js (react-chartjs-2) | Chart.js is canvas-based (lighter) but Recharts has better React integration via JSX composition -- preferable for this project's React component patterns |
| recharts | Pure CSS bar charts | No dependency but too limited for pie charts and interactive drill-down |
| Custom modal | @headlessui/react Dialog | Already in deps (^1.7.18) -- could use, but framer-motion + createPortal pattern is already established in MissionPlannerForm's ShipDropdownPortal |

**Installation:**
```bash
npm install recharts
```

**Confidence:** HIGH -- Recharts is the most widely used React-specific charting library, well-documented, TypeScript support built in.

## Architecture Patterns

### Existing Assets to Reuse (NOT Rebuild)

These were built in Phases 4-5 and are production-ready:

| Asset | Location | Reuse Context |
|-------|----------|---------------|
| `useShips` hook | `src/hooks/useShips.ts` | Ship picker modals (paginated search + filter) |
| `useShipDetail` hook | `src/hooks/useShipDetail.ts` | Profile inline expand, individual ship resolution |
| `ShipFilterPanel` | `src/components/ships/ShipFilterPanel.tsx` | Filter UI inside modal pickers |
| `ShipSearchBar` | `src/components/ships/ShipSearchBar.tsx` | Search inside modal pickers |
| `ShipCard` | `src/components/ships/ShipCard.tsx` | Ship display in modal picker results |
| `resolveShipImage()` | `src/lib/ships/image.ts` | All ship images (replaces resolveShipImageLegacy) |
| `formatCrew/Cargo/Speed` | `src/lib/ships/format.ts` | Spec display everywhere |
| `POST /api/ships/batch` | `src/app/api/ships/batch/route.ts` | Batch resolve user fleet ships by fleetyardsId array |
| `GET /api/ships/manufacturers` | `src/app/api/ships/manufacturers/route.ts` | Manufacturer list for filters |

### Recommended New Component Structure

```
src/
  components/
    ships/
      FleetShipPickerModal.tsx    # INT-01: Fleet builder ship picker modal
      MissionShipPickerModal.tsx  # INT-02: Mission planner ship picker modal
      ProfileShipCard.tsx         # INT-04: Compact ship card for profile display
      MissionParticipantShip.tsx  # INT-03/INT-05: Ship display in mission roster
    fleet-composition/
      FleetCompositionPage.tsx    # INT-06: Main dashboard page component
      FleetCompositionTabs.tsx    # Tab switcher (role, manufacturer, size)
      FleetBreakdownChart.tsx     # Recharts pie/bar chart component
      FleetBreakdownTable.tsx     # Expandable table for drill-down detail
  hooks/
    useShipBatch.ts               # New hook: batch resolve ships by fleetyardsId[]
    useOrgFleet.ts                # New hook: fetch all users' ships and aggregate
  app/
    dashboard/
      fleet-composition/
        page.tsx                  # INT-06: New route for fleet composition
```

### Pattern 1: Modal Ship Picker with useShips

**What:** A full-screen or large modal dialog that embeds filter + search + paginated ship grid, where clicking a ship selects it.

**When to use:** Fleet builder (INT-01) and mission planner (INT-02) ship selection.

**Key design:**
- Uses `useShips` hook for data fetching (same as browse page)
- Composes `ShipFilterPanel` + `ShipSearchBar` for filtering (or lightweight variants)
- Renders ships in a grid using `ShipCard` or a simplified card
- Fleet builder: single-select, instant close on pick
- Mission planner: multi-select with pending selections (similar to current ShipDropdownPortal behavior)
- Both use `createPortal` to render at document.body (consistent with existing pattern)

**Example flow:**
```typescript
// Fleet builder modal: user clicks "Add Ship" -> modal opens
// Modal manages its own filter state via useReducer (matching Phase 5 pattern)
// useShips(filters) fetches paginated results
// User clicks ship -> onSelect(shipDocument) fires -> modal closes
// Parent receives ShipDocument, extracts: name, manufacturer.name, fleetyardsId, images
```

### Pattern 2: Batch Ship Resolution for Display

**What:** When displaying a user's fleet or mission roster, resolve ship data from stored fleetyardsId values using the batch API.

**When to use:** Profile ship display (INT-04), mission participant ships (INT-03), fleet composition dashboard (INT-06).

**Key design:**
- Users store `UserShip[]` with `fleetyardsId` strings
- On mount, collect all unique fleetyardsIds and POST to `/api/ships/batch`
- Returns `ShipDocument[]` -- map by fleetyardsId for O(1) lookup
- Ships with empty fleetyardsId (`''`) or missing from batch response are handled gracefully

**Example:**
```typescript
// New hook: useShipBatch
function useShipBatch(ids: string[]): { ships: Map<string, ShipDocument>; isLoading: boolean; error: string | null }
// Filter out empty IDs, deduplicate, POST to /api/ships/batch
// Return a Map<fleetyardsId, ShipDocument> for easy lookup
```

### Pattern 3: Fleet Composition Aggregation

**What:** Fetch all org members' ships, resolve each via batch API, then aggregate counts by role/manufacturer/size.

**When to use:** Fleet composition dashboard (INT-06).

**Key design:**
- `GET /api/users` already returns `ships[]` for each user (confirmed in route.ts)
- Collect all unique fleetyardsIds from all users' ships
- Batch-resolve via `/api/ships/batch` (may need multiple batches if >50 unique ships)
- Aggregate into three views: by classification, by manufacturer.name, by size
- Recharts `PieChart` + `BarChart` for visualization
- Expandable rows for drill-down (show individual ship models within a category)

### Anti-Patterns to Avoid

- **Do NOT import from `@/lib/ship-data`** or `loadShipDatabase()` in any Phase 6 code -- that's the static data being replaced
- **Do NOT import from `@/types/ShipData` for data** -- `getManufacturersList()`, `getShipsByManufacturer()`, `shipManufacturers[]` are all deprecated static data. Type interfaces like `ShipDetails` can still be referenced where needed for legacy compatibility, but new code should use `ShipDocument` from `@/types/ship`
- **Do NOT hand-roll image URL construction** -- always use `resolveShipImage(ship.images, view)` from `@/lib/ships/image`
- **Do NOT create a shared/generic ship picker** -- decision locked: separate picker components for fleet builder vs mission planner
- **Do NOT add pagination to profile ship display** -- decision locked: show all ships at once

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Ship image URL resolution | Manual CDN URL construction | `resolveShipImage(images, view)` | Has fallback chain (view -> angled -> store -> placeholder) |
| Ship data formatting (crew, cargo, speed) | Inline string formatting | `formatCrew()`, `formatCargo()`, `formatSpeed()` from `@/lib/ships/format` | Handles edge cases (0 values, null, ranges) |
| Paginated ship search | Custom fetch logic | `useShips(filters)` hook | Has AbortController, error handling, loading state |
| Single ship detail fetch | Custom fetch logic | `useShipDetail(id)` hook | Has AbortController, null handling |
| Filter panel UI | Custom select elements | `ShipFilterPanel` component | Fetches manufacturers from API, has all filter axes |
| Search with debounce | Custom debounce | `ShipSearchBar` component | 300ms debounce, external value sync, clear button |
| Ship placeholder image | Hardcoded path | `getShipPlaceholder()` from `@/lib/ships/image` | Single source of truth for `/assets/ship-placeholder.png` |
| Charts for dashboard | Custom SVG/Canvas | Recharts | Handles responsive sizing, tooltips, legends, animations |

## Common Pitfalls

### Pitfall 1: Empty fleetyardsId on Legacy Ships

**What goes wrong:** Users added ships before Phase 6 when `fleetyardsId` was set to `''` (placeholder from Phase 4). Batch resolve will skip these.
**Why it happens:** `shipDetailsToMissionShip()` and the fleet builder both set `fleetyardsId: ''` until Phase 6 wires the real lookup.
**How to avoid:** When rendering ships with empty fleetyardsId, fall back to the legacy `image` field on `UserShip` or `MissionShip` (both have optional `image?`). Display ship name/manufacturer from stored data even when resolution fails.
**Warning signs:** Ships appearing without images after Phase 6 deployment.

### Pitfall 2: Batch API Limit of 50

**What goes wrong:** If org has >50 unique ship models across all members, a single batch request fails.
**Why it happens:** `POST /api/ships/batch` validates `ids: z.array(z.string().uuid()).min(1).max(50)`.
**How to avoid:** The `useOrgFleet` hook must chunk IDs into batches of 50, resolve sequentially or in parallel, then merge results.
**Warning signs:** 400 errors from batch endpoint when org grows.

### Pitfall 3: Server Module Import in Client Code

**What goes wrong:** Importing from `@/lib/ship-storage` or `@/types/ship` (which imports `mongodb` ObjectId) in client components causes build errors.
**Why it happens:** Phase 5 decision [05-01]: `ShipQueryResult` was defined locally in useShips to avoid this exact problem.
**How to avoid:** Only import `ShipDocument` from `@/types/ship` in client code (interface-only, no runtime MongoDB import). For hooks and components, use locally-defined types or import from hooks that re-export them.
**Warning signs:** "Module not found: Can't resolve 'mongodb'" in client bundle.

### Pitfall 4: UserShip Type Mismatch with ShipDocument

**What goes wrong:** `UserShip` has `{ manufacturer: string, name: string, fleetyardsId: string }` but `ShipDocument` has `{ manufacturer: { name, code, slug, logo }, name, fleetyardsId }`.
**Why it happens:** UserShip stores a flat manufacturer string; ShipDocument has a nested object.
**How to avoid:** When saving a selected ShipDocument to a user's fleet, extract `ship.manufacturer.name` for the `manufacturer` field on `UserShip`. The mapping is: `{ manufacturer: ship.manufacturer.name, name: ship.name, fleetyardsId: ship.fleetyardsId }`.
**Warning signs:** Manufacturer showing as `[object Object]` in fleet display.

### Pitfall 5: MissionShip fleetyardsId Still Empty

**What goes wrong:** `shipDetailsToMissionShip()` in `PlannedMission.ts` still sets `fleetyardsId: ''` with a `TODO` comment.
**Why it happens:** This was a Phase 4 placeholder. The mission planner ship picker must now set the real fleetyardsId from the ShipDocument.
**How to avoid:** Create a new `shipDocumentToMissionShip(ship: ShipDocument)` helper that maps correctly, or update `shipDetailsToMissionShip` to accept ShipDocument.
**Warning signs:** Mission ships not resolving images after Phase 6.

### Pitfall 6: Stale Closure in Modal Filter State

**What goes wrong:** Filter changes don't reset page to 1, or search value is stale after filter change.
**Why it happens:** Phase 5 learned this the hard way and solved it with `useReducer` [05-05].
**How to avoid:** Use `useReducer` for filter state in modal pickers, matching the pattern from `ShipBrowsePage`.
**Warning signs:** Changing a filter shows "No results" because page is still >1.

## Code Examples

### Mapping ShipDocument to UserShip (for Fleet Builder)

```typescript
// When user selects a ship from the picker modal
function shipDocumentToUserShip(ship: ShipDocument): UserShip {
  return {
    manufacturer: ship.manufacturer.name,
    name: ship.name,
    fleetyardsId: ship.fleetyardsId,
    image: resolveShipImage(ship.images, 'store'), // Optional transitional field
  };
}
```

### Mapping ShipDocument to MissionShip (for Mission Planner)

```typescript
// When user selects a ship from the mission picker modal
function shipDocumentToMissionShip(ship: ShipDocument, quantity: number = 1): MissionShip {
  return {
    shipName: ship.name,
    manufacturer: ship.manufacturer.name,
    size: ship.size || 'medium',
    role: ship.classification ? [ship.classificationLabel] : [],
    fleetyardsId: ship.fleetyardsId,
    image: resolveShipImage(ship.images, 'store'),
    quantity,
    notes: '',
  };
}
```

### Batch Ship Resolution Hook

```typescript
// src/hooks/useShipBatch.ts
'use client';
import { useState, useEffect, useRef } from 'react';
import type { ShipDocument } from '@/types/ship';

export function useShipBatch(ids: string[]) {
  const [ships, setShips] = useState<Map<string, ShipDocument>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Filter empty/invalid IDs
    const validIds = [...new Set(ids.filter(id => id && id.length > 0))];
    if (validIds.length === 0) {
      setShips(new Map());
      setIsLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    async function fetchBatch() {
      setIsLoading(true);
      setError(null);
      try {
        // Chunk into batches of 50
        const chunks: string[][] = [];
        for (let i = 0; i < validIds.length; i += 50) {
          chunks.push(validIds.slice(i, i + 50));
        }

        const allShips: ShipDocument[] = [];
        for (const chunk of chunks) {
          const res = await fetch('/api/ships/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: chunk }),
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`Batch resolve failed (${res.status})`);
          const data = await res.json();
          allShips.push(...data.items);
        }

        const map = new Map<string, ShipDocument>();
        for (const ship of allShips) {
          map.set(ship.fleetyardsId, ship);
        }
        setShips(map);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to resolve ships');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    fetchBatch();
    return () => controller.abort();
  }, [ids.join(',')]); // Stringify IDs for stable dependency

  return { ships, isLoading, error };
}
```

### Recharts Example for Fleet Composition

```typescript
// Simple pie chart for fleet by classification
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface CategoryCount {
  name: string;
  count: number;
}

function FleetPieChart({ data }: { data: CategoryCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

## State of the Art

| Old Approach (Current) | New Approach (Phase 6) | Impact |
|------------------------|----------------------|--------|
| `getManufacturersList()` static array | `GET /api/ships/manufacturers` dynamic | Always current with synced data |
| `getShipsByManufacturer()` static function | `useShips({ manufacturer: slug })` hook | Paginated, filtered, searched |
| `loadShipDatabase()` from JSON file | `useShips` / `useShipBatch` from API | No static JSON dependency |
| `resolveShipImageLegacy(name)` by name | `resolveShipImage(ship.images, view)` by ShipDocument | Uses FleetYards CDN URLs directly |
| `shipDetailsToMissionShip(ship)` with empty fleetyardsId | New mapper with real fleetyardsId from ShipDocument | Ships properly linked to database |
| Ship picker via `<select>` dropdowns | Modal with full filter/search grid | Matches browse page UX, more discoverable |

**Deprecated/outdated (used in current code, replaced in Phase 6):**
- `ShipData.ts` exports: `getManufacturersList()`, `getShipsByManufacturer()`, `shipManufacturers[]`, `shipDatabase[]`
- `@/lib/ship-data` exports: `loadShipDatabase()`
- `resolveShipImageLegacy()` from `@/lib/ships/image`
- `shipDetailsToMissionShip()` from `@/types/PlannedMission` (needs replacement that sets real fleetyardsId)
- `ShipDropdownPortal` in `MissionPlannerForm.tsx` (replaced by MissionShipPickerModal)

## Data Flow Architecture

### INT-01: Fleet Builder

```
User clicks "Add Ship"
  -> FleetShipPickerModal opens
  -> useShips(filters) fetches paginated ships from /api/ships
  -> User clicks a ship
  -> shipDocumentToUserShip(ship) creates UserShip with real fleetyardsId
  -> onAddShip(userShip) fires
  -> UserFleetBuilderWrapper saves to /api/profile
  -> Modal closes

Display existing fleet:
  -> UserFleetBuilderWrapper fetches profile (ships[])
  -> Collect fleetyardsIds from ships
  -> useShipBatch(ids) resolves to ShipDocument[]
  -> Render with FleetYards images via resolveShipImage()
  -> Ships with empty fleetyardsId: show name/manufacturer only (graceful fallback)
```

### INT-04: Profile Ship Display

```
UserProfileContent loads profile data
  -> profile.ships has UserShip[] with fleetyardsId
  -> useShipBatch(ids) resolves to ShipDocument Map
  -> Render ProfileShipCard for each ship
  -> Card shows: FleetYards image, manufacturer logo, name, size, classification
  -> Click card: expand in-place with more details (from resolved ShipDocument)
```

### INT-03/INT-05: Mission Detail Ship Display

```
MissionDetail loads mission
  -> mission.participants[] each have fleetyardsId (optional)
  -> For participants with fleetyardsId: useShipBatch resolves ships
  -> Render participant with ship thumbnail, name, role, size class
  -> Unresolved ships: show participant name and role only (no image, no placeholder)
  -> INT-05: Contextual specs -- show cargo for haul missions, crew for multi-crew
```

### INT-06: Fleet Composition Dashboard

```
Page loads
  -> GET /api/users (all members with ships[])
  -> Collect all unique fleetyardsIds across all users
  -> POST /api/ships/batch (chunked if >50)
  -> For each user's ship, look up ShipDocument
  -> Aggregate counts: by classification, by manufacturer.name, by size
  -> Render three tab views with Recharts + expandable detail tables
```

## API Endpoints Used

| Endpoint | Method | Purpose in Phase 6 | Cache |
|----------|--------|---------------------|-------|
| `/api/ships` | GET | Modal pickers (paginated search + filter) | 300s + 60s SWR |
| `/api/ships/[id]` | GET | Detail panel for inline expand | 300s + 60s SWR |
| `/api/ships/batch` | POST | Resolve user fleets, mission rosters | no-store |
| `/api/ships/manufacturers` | GET | Filter panel manufacturer list | 1h |
| `/api/users` | GET | Fleet composition: all members' ships | no-store |
| `/api/profile` | GET/PUT | Read/write user's ship fleet | no-store |

## Open Questions

1. **Org fleet composition data freshness**
   - What we know: `GET /api/users` returns all users with `ships[]` and is cached `no-store`
   - What's unclear: For a large org, this could be slow. Currently returns all users in one page (default pageSize=50).
   - Recommendation: For Phase 6, fetch all pages by iterating until `page >= totalPages`. Consider a dedicated aggregation API endpoint in Phase 7 if performance becomes an issue.

2. **User ship migration for existing empty fleetyardsIds**
   - What we know: Ships added before Phase 6 have `fleetyardsId: ''`. They will not resolve via batch API.
   - What's unclear: Should Phase 6 include a one-time migration script to match existing ship names to fleetyardsIds?
   - Recommendation: Handle gracefully in UI (show name-only for unresolved ships). A migration script could be added as an optional plan within Phase 6 or deferred to Phase 7 cleanup.

3. **Recharts bundle size impact**
   - What we know: Recharts depends on some D3 submodules. Only used on the fleet composition page.
   - What's unclear: Exact bundle impact on this project.
   - Recommendation: Import Recharts components only in the fleet-composition page component. Next.js code-splitting ensures it's only loaded when that route is accessed.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of 20+ source files in current project
- `useShips`, `useShipDetail` hooks -- verified API contract and patterns
- `POST /api/ships/batch` route -- verified Zod schema (1-50 UUIDs)
- `GET /api/users` route -- confirmed returns `ships[]` per user
- `ShipDocument` type -- verified full field structure including images and manufacturer
- `UserShip` type -- verified: `{ manufacturer: string, name: string, fleetyardsId: string, image?: string }`
- `MissionShip` type -- verified: includes fleetyardsId, image (both optional for transition)
- `resolveShipImage()` -- verified fallback chain implementation
- Existing `ShipDropdownPortal` in MissionPlannerForm -- verified current pattern (createPortal, filter state, multi-select)

### Secondary (MEDIUM confidence)
- [Recharts vs Chart.js comparison](https://blog.logrocket.com/best-react-chart-libraries-2025/) -- Recharts recommended for React dashboards
- [React charting landscape 2025](https://embeddable.com/blog/react-chart-libraries) -- confirms Recharts as standard choice
- Recharts TypeScript support confirmed by multiple sources

### Tertiary (LOW confidence)
- Recharts exact version (^2.15) -- based on latest stable as of research date; verify with `npm info recharts version` before installing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries either already in project or well-established (Recharts)
- Architecture: HIGH -- patterns directly derived from existing Phase 5 codebase analysis
- Pitfalls: HIGH -- identified from direct code inspection of current components and types
- Dashboard charting: MEDIUM -- Recharts recommendation based on web research, not hands-on verification in this project

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (stable -- no fast-moving dependencies)
