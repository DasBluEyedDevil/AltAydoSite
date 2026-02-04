# Phase 5: Ship Browse & Display - Research

**Researched:** 2026-02-03
**Domain:** Next.js 15 frontend UI (React 18, Tailwind CSS, Framer Motion) with existing MobiGlas design system
**Confidence:** HIGH

## Summary

Phase 5 builds a ship browsing UI on top of the fully-functional ship API layer completed in Phases 1-4. The core technical challenge is not library selection (the stack is already established) but rather composing a complex, interactive page using the existing MobiGlas design system components and patterns already present in the codebase.

The project already has: Next.js 15.3.3 with App Router, React 18, Tailwind CSS 3.3, Framer Motion 10.16, a comprehensive MobiGlas UI component library (`MobiGlasPanel`, `MobiGlasButton`, `MobiGlasInput`, `CornerAccents`, `StatusIndicator`, `ScanlineEffect`, `HolographicBorder`, `DataStreamBackground`), and a fully-built ship API at `/api/ships` with pagination, multi-axis filtering, text search, and single-ship lookup.

The research focus was: (1) understanding the exact API response shapes to avoid round-trips, (2) mapping MobiGlas component capabilities to the UI requirements, (3) identifying missing pieces (sync status endpoint, placeholder asset, relative time formatting), and (4) documenting patterns from existing components to ensure visual consistency.

**Primary recommendation:** Build all Phase 5 UI as client components under `src/app/dashboard/fleet-database/` (replacing the existing "Coming Soon" placeholder), composed from existing MobiGlas primitives, fetching from the existing `/api/ships` endpoints with client-side state management via React hooks.

## Standard Stack

The stack is locked by the existing codebase. No new libraries needed.

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.3.3 | App Router, API routes, Image component | Already in use, provides SSR/CSR flexibility |
| React | ^18 | Component model, hooks for state | Already in use |
| Tailwind CSS | ^3.3.0 | Utility-first styling with MobiGlas CSS variables | Already configured with MobiGlas theme extensions |
| Framer Motion | ^10.16.4 | Animations, transitions, AnimatePresence | Used by all MobiGlas components |
| Zod | ^3.24.4 | Runtime validation of API responses on client | Already used for API param validation |
| @heroicons/react | ^2.1.1 | Icon set | Already available, used in existing components |

### Supporting (Already Installed but Unused)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @headlessui/react | ^1.7.18 | Accessible combobox, listbox, disclosure | Filter dropdowns if select elements prove insufficient |

### No New Dependencies Needed
| Problem | Don't Install | Use Instead | Why |
|---------|---------------|-------------|-----|
| Relative time ("2 hours ago") | date-fns, timeago.js | Custom `formatRelativeTime()` utility (~15 lines) | Only one use case; adding a dependency for one function is wasteful |
| Image gallery | react-image-gallery, lightbox libs | Custom component with Next/Image | Only 4 images max; existing `ShipImage` component provides the pattern |
| Pagination | pagination libraries | Custom component | Simple page number UI; the API already handles pagination logic |
| Slide-out panel | dialog/drawer libraries | Custom component with Framer Motion AnimatePresence | Framer Motion already provides slide animations; keep consistent with MobiGlas |
| State management | Redux, Zustand, Jotai | React useState + useReducer | Session-only filter state per user decision; no persistence needed |

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    dashboard/
      fleet-database/
        page.tsx                    # Replace existing "Coming Soon" placeholder
        FleetDatabaseClient.tsx     # Main client component (orchestrator)
  components/
    ships/                          # New directory for ship browse components
      ShipBrowsePage.tsx            # Page layout: header, filters, grid, pagination, detail panel
      ShipFilterPanel.tsx           # Collapsible filter panel with all filter axes
      ShipFilterChips.tsx           # Active filter chip display (removable tags)
      ShipSearchBar.tsx             # Text search input with debounce
      ShipCard.tsx                  # Individual ship card (grid mode)
      ShipCardList.tsx              # Individual ship row (list mode)
      ShipGrid.tsx                  # Grid/list container with view toggle
      ShipDetailPanel.tsx           # Slide-out detail panel from right
      ShipImageGallery.tsx          # Image gallery with thumbnail strip
      ShipSpecs.tsx                 # Specs display (dimensions, crew, cargo, speed)
      ShipPagination.tsx            # Page number pagination with result count
      SyncStatusIndicator.tsx       # "Last synced: 2 hours ago" footer
  hooks/
    useShips.ts                     # Custom hook: fetches /api/ships with filter state
    useShipDetail.ts                # Custom hook: fetches /api/ships/[id] for detail panel
    useSyncStatus.ts                # Custom hook: fetches sync status for freshness indicator
  lib/
    ships/
      image.ts                      # Already exists: resolveShipImage()
      format.ts                     # New: formatRelativeTime(), formatDimensions(), etc.
```

### Pattern 1: Client-Side Data Fetching with Custom Hooks
**What:** All ship browsing is client-side. Hooks manage fetch state, caching, and error handling.
**When to use:** Every data-fetching component in this phase.
**Why:** The ship API returns paginated data based on user-selected filters. Server components cannot respond to user interactions. The existing Mission Planner and Fleet Builder both use client-side fetch patterns.

```typescript
// Pattern from existing codebase (UserFleetBuilderWrapper.tsx)
// All fetch calls use: credentials: 'include', Cache-Control headers
const response = await fetch('/api/ships?page=1&pageSize=24&manufacturer=aegis-dynamics', {
  credentials: 'include',
});
const data: ShipQueryResult = await response.json();
// data.items: ShipDocument[], data.total, data.page, data.pageSize, data.totalPages
```

### Pattern 2: MobiGlas Component Composition
**What:** All UI elements compose from existing MobiGlas primitives. Never create raw divs with MobiGlas styling inline when a component exists.
**When to use:** Every visual element.

```typescript
// CORRECT: Use MobiGlasPanel for containers
<MobiGlasPanel
  variant="dark"
  cornerAccents={true}
  cornerSize="sm"
  padding="sm"
>
  {/* Ship card content */}
</MobiGlasPanel>

// CORRECT: Use MobiGlasButton for actions
<MobiGlasButton variant="ghost" size="sm" onClick={clearFilters}>
  Clear Filters
</MobiGlasButton>

// WRONG: Raw div with inline MobiGlas styles
<div className="bg-[rgba(var(--mg-dark),0.4)] border border-[rgba(var(--mg-primary),0.3)]">
```

### Pattern 3: MobiGlas CSS Variable Usage
**What:** All colors reference CSS variables via the `rgba(var(--mg-*), opacity)` pattern.
**When to use:** Every style declaration.

Key CSS variables (from globals.css `:root`):
```css
--mg-primary: 0, 215, 255;      /* Bright cyan -- primary UI color */
--mg-secondary: 0, 140, 210;    /* Deeper blue */
--mg-accent: 30, 250, 255;      /* Bright cyan accent */
--mg-warning: 255, 180, 0;      /* Amber */
--mg-danger: 255, 70, 70;       /* Red (NOTE: components also use --mg-error which is NOT defined; use --mg-danger instead) */
--mg-success: 20, 255, 170;     /* Green */
--mg-dark: 0, 16, 32;           /* Dark blue -- panel backgrounds */
--mg-background: 0, 8, 20;      /* Very dark blue -- page background */
--mg-text: 180, 240, 255;       /* Light blue -- body text */
--mg-panel-dark: 0, 12, 24;     /* Panel darker background */
```

Common patterns from existing components:
```css
/* Panel background */  bg-[rgba(var(--mg-panel-dark),0.5)]
/* Border */            border border-[rgba(var(--mg-primary),0.3)]
/* Text primary */      text-[rgba(var(--mg-primary),0.9)]
/* Text body */         text-[rgba(var(--mg-text),0.8)]
/* Text dim */          text-[rgba(var(--mg-text),0.6)]
/* Hover highlight */   hover:bg-[rgba(var(--mg-primary),0.1)]
/* Selected state */    bg-[rgba(var(--mg-primary),0.15)] border-[rgba(var(--mg-primary),0.5)]
```

### Pattern 4: Framer Motion Animations (Consistent with Existing)
**What:** Entry animations, hover states, and layout transitions follow existing patterns.
**When to use:** Component mounting, view transitions, panel open/close.

```typescript
// Entry animation (from MissionFilters.tsx)
const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, staggerChildren: 0.1 }
  }
};

// Slide-out panel (right side, new pattern for this phase)
<AnimatePresence>
  {selectedShip && (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed right-0 top-0 bottom-0 w-[480px] z-50"
    >
      {/* Detail panel content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Pattern 5: Next/Image for Ship Images
**What:** Use Next.js Image component for all ship images from FleetYards CDN.
**When to use:** Every ship image display.

```typescript
// next.config.js already has cdn.fleetyards.net in remotePatterns
import Image from 'next/image';
import { resolveShipImage, ShipImageView } from '@/lib/ships/image';

// For ship cards (store image)
<Image
  src={resolveShipImage(ship.images, 'store')}
  alt={ship.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
  className="object-cover"
  loading="lazy"
/>

// For detail panel gallery (specific view)
<Image
  src={resolveShipImage(ship.images, activeView)}
  alt={`${ship.name} - ${activeView} view`}
  fill
  sizes="480px"
  className="object-contain"
  loading="eager"  // Detail panel images should load immediately
/>
```

### Anti-Patterns to Avoid
- **Don't use `getShipImagePath()` or `resolveShipImageLegacy()`:** These are legacy Phase 7 removal candidates. Always use `resolveShipImage(images, view)` from `@/lib/ships/image`.
- **Don't use `getShipsByManufacturer()` from ShipData.ts:** This is the old static data loader. Use `/api/ships?manufacturer=slug` instead.
- **Don't build filter state into URL params:** User decision explicitly states "session-only, resets on page reload." Use React state only.
- **Don't use `--mg-error` CSS variable:** It is not defined in globals.css. Use `--mg-danger` (255, 70, 70) for error states.
- **Don't add authentication checks:** Ship data is public reference data. The API routes already have no auth. The page should be accessible without login (or within dashboard layout -- check existing pattern).
- **Don't fetch all ships at once:** The API is paginated. Always pass `page` and `pageSize` parameters.

## Don't Hand-Roll

Problems that have existing solutions in the codebase:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Ship image resolution | Custom image URL construction | `resolveShipImage(images, view)` from `@/lib/ships/image` | Handles fallback chain (view -> angled -> store -> placeholder) |
| Ship placeholder image | Inline SVG or missing-image handling | `/assets/ship-placeholder.png` (verified to exist) | Already in `public/assets/`, returned by `getShipPlaceholder()` |
| Panel containers | Raw div with border/background | `MobiGlasPanel` component | Handles variants, corners, scanlines, hologram effects |
| Buttons | Raw button elements | `MobiGlasButton` component | Handles variants, sizes, loading states, hover effects |
| Input fields | Raw input elements | `MobiGlasInput` component | Handles labels, errors, corner accents, a11y |
| Status indicators | Custom badge styling | `StatusIndicator` component | Handles multiple statuses, sizes, animations |
| Loading skeletons | Custom skeleton CSS | `animate-pulse bg-[rgba(var(--mg-primary),0.1)]` | Pattern already used in `UserFleetBuilderWrapper` |
| Entry animations | CSS transitions | Framer Motion variants | Consistent with all existing page animations |
| API pagination logic | Custom offset/limit logic | `/api/ships` already handles `page` and `pageSize` | Returns `{ items, total, page, pageSize, totalPages }` |
| Manufacturer list | Hardcoded manufacturer array | `/api/ships/manufacturers` endpoint | Returns `{ items: [{ name, code, slug, shipCount }] }` |

## Common Pitfalls

### Pitfall 1: Debounce on Text Search
**What goes wrong:** Each keystroke triggers an API call, causing 429 rate limits or sluggish UI.
**Why it happens:** Text search input fires onChange on every character.
**How to avoid:** Debounce the search input by 300ms before triggering API fetch. Use a simple `setTimeout`/`clearTimeout` pattern or a `useDebouncedValue` hook.
**Warning signs:** Network tab shows dozens of `/api/ships?search=...` requests during typing.

### Pitfall 2: Stale Closure in Filter State
**What goes wrong:** Filter changes don't combine properly; previous filter values are lost.
**Why it happens:** Multiple `setState` calls in the same render cycle can use stale closures.
**How to avoid:** Use a single `useReducer` for all filter state, or use functional updates `setFilters(prev => ({ ...prev, manufacturer: 'aegis' }))`.
**Warning signs:** Changing one filter resets another filter to its default.

### Pitfall 3: FleetYards CDN Image Failures
**What goes wrong:** Some ships have null image URLs for certain views, causing broken images.
**Why it happens:** Not all ships have all image angles (especially concept ships).
**How to avoid:** Always use `resolveShipImage()` which handles the fallback chain. Also add `onError` handler on Image components to swap to placeholder.
**Warning signs:** Broken image icons appearing in the ship grid.

### Pitfall 4: Slide-Out Panel Z-Index Conflicts
**What goes wrong:** The detail panel appears behind the dashboard sidebar or navigation.
**Why it happens:** The dashboard layout has its own z-index stacking context.
**How to avoid:** Use `z-50` for the panel overlay and `z-[60]` for the panel itself. Add a semi-transparent backdrop behind the panel.
**Warning signs:** Panel content is partially obscured by navigation elements.

### Pitfall 5: Missing Sync Status API Endpoint
**What goes wrong:** No API route exists to fetch the last sync timestamp for the freshness indicator.
**Why it happens:** Phase 1-2 only built ship CRUD endpoints, not a sync status query endpoint.
**How to avoid:** Create a new `/api/ships/sync-status` GET endpoint that calls `getLatestSyncStatus()` from `ship-storage.ts`. The function already exists but is only used internally by the sync engine.
**Warning signs:** Data freshness indicator has no data source.

### Pitfall 6: Page Size and Layout Shift
**What goes wrong:** Large page sizes (50+) cause layout shifts as images load, or small pages feel empty.
**Why it happens:** Grid layout with lazy-loaded images changes height as images pop in.
**How to avoid:** Use fixed-aspect-ratio containers for ship card images (the existing `ShipImage` component does this). Set page size to 24 (fills 4x6, 3x8, or 2x12 grid cleanly).
**Warning signs:** Page jumps/flickers as ship images load in.

### Pitfall 7: Manufacturer Filter Uses Slugs, Not Names
**What goes wrong:** Filter sends manufacturer display name ("Aegis Dynamics") but API expects slug ("aegis-dynamics").
**Why it happens:** The manufacturers endpoint returns both `name` and `slug`. The filter dropdown must display `name` but send `slug` as the query parameter.
**How to avoid:** Store manufacturer objects (not just names) in filter state. Display `name` in dropdown, send `slug` in API call.
**Warning signs:** Manufacturer filter returns 0 results despite ships existing.

## Code Examples

### API Response Shapes (verified from existing route code)

```typescript
// GET /api/ships?page=1&pageSize=24&manufacturer=aegis-dynamics&search=gladius
// Response shape (from ShipQueryResult in ship-storage.ts):
interface ShipQueryResult {
  items: ShipDocument[];  // Array of ship documents
  total: number;          // Total matching ships (for "Showing X-Y of Z")
  page: number;           // Current page number
  pageSize: number;       // Items per page
  totalPages: number;     // Total pages available
}

// GET /api/ships/manufacturers
// Response shape:
interface ManufacturersResponse {
  items: ManufacturerInfo[];  // { name, code, slug, shipCount }[]
}

// GET /api/ships/[id]
// Response: single ShipDocument (no wrapper)

// ship-storage.ts getLatestSyncStatus() returns:
interface SyncStatusDocument {
  type: 'ship-sync';
  syncVersion: number;
  lastSyncAt: Date;       // This is the timestamp for "Last synced: X ago"
  shipCount: number;
  status: 'success' | 'partial' | 'failed';
  // ... other audit fields
}
```

### Custom useShips Hook Pattern
```typescript
// Source: Pattern derived from existing UserFleetBuilderWrapper.tsx fetch pattern
interface ShipFilters {
  page: number;
  pageSize: number;
  manufacturer?: string;
  size?: string;
  classification?: string;
  productionStatus?: string;
  search?: string;
}

function useShips(filters: ShipFilters) {
  const [data, setData] = useState<ShipQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page));
    params.set('pageSize', String(filters.pageSize));
    if (filters.manufacturer) params.set('manufacturer', filters.manufacturer);
    if (filters.size) params.set('size', filters.size);
    if (filters.classification) params.set('classification', filters.classification);
    if (filters.productionStatus) params.set('productionStatus', filters.productionStatus);
    if (filters.search) params.set('search', filters.search);

    setIsLoading(true);
    fetch(`/api/ships?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [filters.page, filters.pageSize, filters.manufacturer, filters.size,
      filters.classification, filters.productionStatus, filters.search]);

  return { data, isLoading, error };
}
```

### Relative Time Formatter (No Library Needed)
```typescript
// Simple utility -- no date-fns dependency needed for a single use case
export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
}
```

### Loading Skeleton Pattern (from existing codebase)
```typescript
// Source: UserFleetBuilderWrapper.tsx loading state pattern
function ShipCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[16/9] bg-[rgba(var(--mg-primary),0.1)] rounded-sm" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-[rgba(var(--mg-primary),0.1)] rounded-sm" />
        <div className="h-3 w-1/2 bg-[rgba(var(--mg-primary),0.08)] rounded-sm" />
      </div>
    </div>
  );
}
```

### Filter Chip Component Pattern
```typescript
// Removable filter chip -- similar to MobiGlas badge styling
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs
        bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.3)]
        text-[rgba(var(--mg-primary),0.9)] rounded-sm"
    >
      {label}
      <button onClick={onRemove} className="hover:text-[rgba(var(--mg-danger),0.9)]">
        x
      </button>
    </motion.span>
  );
}
```

## Existing Infrastructure Analysis

### What Already Exists (No Work Needed)
1. **Ship API endpoints** -- `/api/ships`, `/api/ships/[id]`, `/api/ships/batch`, `/api/ships/manufacturers` all complete and tested
2. **Ship data types** -- `ShipDocument`, `ShipQueryResult`, `ManufacturerInfo` all defined
3. **Image resolution** -- `resolveShipImage()` with full fallback chain
4. **Ship placeholder** -- `/assets/ship-placeholder.png` exists in `public/`
5. **MobiGlas component library** -- 8+ components covering panels, buttons, inputs, indicators, effects
6. **Next.js Image CDN config** -- `cdn.fleetyards.net` already in `remotePatterns`
7. **CSS theme system** -- All MobiGlas CSS variables defined, Tailwind extended with MobiGlas colors
8. **Dashboard layout** -- `DashboardClient` layout wrapper already handles sidebar, navigation

### What Must Be Created
1. **Sync status API endpoint** -- `GET /api/ships/sync-status` (calls existing `getLatestSyncStatus()`)
2. **Ship browse components** -- All listed in architecture section above
3. **Custom hooks** -- `useShips`, `useShipDetail`, `useSyncStatus`
4. **Utility functions** -- `formatRelativeTime()` and format helpers
5. **Replace "Coming Soon" page** -- `src/app/dashboard/fleet-database/page.tsx` currently shows placeholder

### Existing Page to Replace
The file `src/app/dashboard/fleet-database/page.tsx` currently contains a "Coming Soon" placeholder with MobiGlasPanel. This file must be replaced with the actual fleet database page. It uses `useSession` for auth checking -- the new page should follow the same pattern since it's inside the dashboard layout.

### Where the Page Lives
Two fleet database pages exist:
1. `src/app/dashboard/fleet-database/page.tsx` -- Inside dashboard (uses session, MobiGlasPanel)
2. `src/app/dashboard/operations/fleet/page.tsx` -- Inside operations (simpler, also "Coming Soon")

Phase 5 should target `fleet-database` as the primary ship browse location. The `operations/fleet` page is a separate concern (likely Phase 6 fleet composition).

## State of the Art

| Old Approach (Pre-Phase 5) | Current Approach (Phase 5) | When Changed | Impact |
|---------------------------|---------------------------|--------------|--------|
| Static `ships.json` + `getShipsByManufacturer()` | API-backed `/api/ships` with filters | Phase 1-2 | All new UI fetches from API |
| `getShipImagePath()` / CDN path construction | `resolveShipImage(images, view)` | Phase 4 | Use document-based image resolution |
| `formatShipImageName()` + R2 CDN | FleetYards CDN URLs stored in ShipDocument | Phase 4 | Images come from FleetYards directly |
| Name-based ship references | UUID-based `fleetyardsId` references | Phase 3 | All ship lookups use UUID or slug |

**Deprecated/outdated (do NOT use):**
- `shipManufacturers` array in `ShipData.ts` -- replaced by `/api/ships/manufacturers`
- `getShipsByManufacturer()` in `ShipData.ts` -- replaced by `/api/ships?manufacturer=slug`
- `resolveShipImageLegacy()` in `lib/ships/image.ts` -- replaced by `resolveShipImage()`
- `getShipImagePath()` / `getDirectImagePath()` in `ShipData.ts` -- replaced by `resolveShipImage()`
- `loadShipDatabase()` in `lib/ship-data.ts` -- replaced by API fetch

## Open Questions

Things that could not be fully resolved from codebase analysis alone:

1. **Available filter values for dropdowns**
   - What we know: The API accepts `size`, `classification`, `productionStatus` as string filters
   - What's unclear: What are the distinct values for each? (e.g., size: "small", "medium", "large" or "vehicle", "snub", "small", "medium", "large", "capital"?)
   - Recommendation: Add a utility function or API call to fetch distinct values from the database, OR hardcode known Star Citizen ship size/classification values as an initial approach. The manufacturers endpoint already exists; size/classification/status may need similar distinct-value endpoints OR the planner can choose to hardcode known SC values.

2. **Dashboard auth requirement**
   - What we know: The existing `fleet-database/page.tsx` checks `useSession()` and shows "Access denied" without auth
   - What's unclear: Should ship browsing be public (no auth needed since ship API is public) or restricted to logged-in dashboard users?
   - Recommendation: Keep it within the dashboard layout (auth required) for consistency. Ship data is public via API but the browse UI is an employee tool. The planner should maintain the existing `useSession` check.

3. **Page size recommendation**
   - What we know: API default is 25 (`pageSize` default in Zod schema). Grid layouts work best with multiples of common column counts (2, 3, 4, 6).
   - Recommendation: Use 24 items per page. Divides evenly by 2, 3, 4, and 6 columns for responsive grid. The API accepts `pageSize` up to 100.

## Sources

### Primary (HIGH confidence)
- Codebase analysis of all files listed in this document (direct file reading)
- `src/types/ship.ts` -- ShipDocument interface with all fields
- `src/lib/ship-storage.ts` -- ShipQueryOptions, ShipQueryResult, ManufacturerInfo interfaces and query implementations
- `src/app/api/ships/route.ts` -- API route with Zod schema showing all query params
- `src/lib/ships/image.ts` -- resolveShipImage() implementation with fallback chain
- `src/components/ui/mobiglas/*.tsx` -- All 8 MobiGlas component implementations
- `src/app/globals.css` -- CSS variable definitions and MobiGlas class implementations
- `tailwind.config.js` -- Theme extensions, color mappings, animation definitions
- `package.json` -- Dependency versions confirmed
- `next.config.js` -- Image remote patterns, webpack config

### Secondary (MEDIUM confidence)
- Existing component patterns (MissionFilters, UserFleetBuilderWrapper) -- verified patterns for filter UI and data fetching

### Tertiary (LOW confidence)
- None -- all findings verified from codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- patterns derived from existing codebase components
- Pitfalls: HIGH -- identified from actual API contracts and component implementations
- API surface: HIGH -- read directly from route handlers and storage module

**Research date:** 2026-02-03
**Valid until:** No expiry (stack is locked, all findings from codebase)
