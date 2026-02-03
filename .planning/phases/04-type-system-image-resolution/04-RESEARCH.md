# Phase 4: Type System & Image Resolution - Research

**Researched:** 2026-02-03
**Domain:** TypeScript type updates, Next.js Image component, FleetYards CDN integration
**Confidence:** HIGH

## Summary

Phase 4 updates four TypeScript type definitions to require `fleetyardsId` (replacing or supplementing the `image` field), builds a new `resolveShipImage()` utility that resolves ship images from the `ShipDocument.images` object, and configures Next.js to load images from `cdn.fleetyards.net`.

The codebase investigation reveals a clear picture: Phase 3 already added `fleetyardsId` to the data in MongoDB (116 references converted), but the TypeScript types do not yet reflect this. The existing `UserShip`, `MissionParticipant`, `MissionShip`, and `OperationParticipant` types still carry an `image: string` field that stores R2/local CDN URLs. The existing `resolveShipImage()` in `src/lib/ships/image.ts` takes a ship name string and builds a URL via `getDirectImagePath()` -- this needs to be replaced with a function that takes a `ShipDocument` (or its images subset) and a view angle, returning the FleetYards CDN URL.

A critical discovery: `next.config.js` does not exist at the project root. It was moved to `scripts/next.config.js` during a refactor (commit `2ea1e1b`). Next.js currently runs with all defaults. Phase 4 must restore a `next.config.js` at the project root with the FleetYards CDN `remotePatterns` entry, along with the existing AydoCorp CDN patterns and webpack/discord.js config from the reference copy.

**Primary recommendation:** Update the four types to add `fleetyardsId: string` (keep `image` as optional for backward compatibility during transition), build a new `resolveShipImage()` that works from `ShipDocument.images`, restore `next.config.js` to the project root with `cdn.fleetyards.net` in `remotePatterns`, and update the `ShipImage` component to use the new resolution function with `onError` fallback.

## Standard Stack

No new libraries are needed for this phase. Everything uses existing project dependencies.

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.3.3 | Image component and remotePatterns config | Already in project |
| typescript | (project version) | Type definitions | Already in project |
| zod | (project version) | Schema validation for profile API | Already in project |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/image | 15.3.3 | Image optimization and CDN loading | All ship image rendering |

**No new packages to install.**

## Architecture Patterns

### Current State (What Exists Today)

```
src/
  types/
    user.ts              # UserShip { manufacturer, name, image }
    Mission.ts           # MissionParticipant { ..., image?: string }
    PlannedMission.ts    # MissionShip { ..., image: string }
    Operation.ts         # OperationParticipant { ..., shipName?, shipManufacturer? }
    ship.ts              # ShipDocument (has images object with 10 URLs)
    ShipData.ts          # Legacy Ship, ShipDetails, formatShipImageName(), etc.
  lib/
    ships/image.ts       # resolveShipImage(model: string) -> CDN URL via name formatting
    ship-data.ts         # loadShipDatabase() from /data/ships.json
    cdn.ts               # cdn() helper for R2/AydoCorp image URLs
  components/
    mission/ShipImage.tsx # <ShipImage model="Aurora MR" /> -> resolveShipImage(model)
    UserFleetBuilder.tsx  # Uses resolveShipImage() and ship.image
```

### Target State (After Phase 4)

```
src/
  types/
    user.ts              # UserShip { manufacturer, name, fleetyardsId, image? }
    Mission.ts           # MissionParticipant { ..., fleetyardsId?, image? }
    PlannedMission.ts    # MissionShip { ..., fleetyardsId, image? }
    Operation.ts         # OperationParticipant { ..., fleetyardsId?, shipName? }
    ship.ts              # (unchanged -- ShipDocument already has images)
  lib/
    ships/image.ts       # resolveShipImage(images, view) -> FleetYards CDN URL
                         # getShipPlaceholder() -> placeholder path
  next.config.js         # RESTORED to root with cdn.fleetyards.net remotePatterns
```

### Pattern 1: Type Update Strategy -- Additive, Not Breaking

**What:** Add `fleetyardsId` to types alongside existing fields rather than replacing them.
**When to use:** Phase 4 (types), with full removal deferred to Phase 7 (cleanup).
**Why:** Components in Phases 5 and 6 still reference `image` field. Breaking it now would cascade failures across 7+ components before they are rewired. Phase 7 removes legacy fields after all consumers are updated.

**Example -- UserShip type update:**
```typescript
// src/types/user.ts -- BEFORE
export interface UserShip {
  manufacturer: string;
  name: string;
  image: string;
}

// src/types/user.ts -- AFTER (Phase 4)
export interface UserShip {
  manufacturer: string;
  name: string;
  fleetyardsId: string;
  image?: string; // Kept optional for transition; removed in Phase 7
}
```

**Rationale:** The migration (Phase 3) already wrote `fleetyardsId` into the data. Making it required in the type means TypeScript will enforce it going forward. Making `image` optional (not removed) avoids breaking the ~7 components that still read `ship.image` until Phase 6 rewires them.

### Pattern 2: Image Resolution from ShipDocument

**What:** Replace name-based image resolution with document-based resolution using the `ShipDocument.images` object.
**When to use:** Whenever rendering a ship image, once a ShipDocument (or its images subset) is available.

**Current `resolveShipImage` signature (name-based):**
```typescript
// src/lib/ships/image.ts -- CURRENT
export function resolveShipImage(model: string): string {
  // Formats ship name -> CDN path via getDirectImagePath
}
```

**New `resolveShipImage` signature (document-based):**
```typescript
// src/lib/ships/image.ts -- NEW

/** View angles supported by ShipDocument.images */
export type ShipImageView = 'angled' | 'side' | 'top' | 'front' | 'store' | 'fleetchart';

/** Minimal images shape needed for resolution (subset of ShipDocument) */
export type ShipImages = {
  store: string | null;
  angledView: string | null;
  angledViewMedium: string | null;
  sideView: string | null;
  sideViewMedium: string | null;
  topView: string | null;
  topViewMedium: string | null;
  frontView: string | null;
  frontViewMedium: string | null;
  fleetchartImage: string | null;
};

/**
 * Resolves a ship image URL from the ShipDocument images object.
 * Falls back through: requested view -> angled view -> store image -> placeholder.
 */
export function resolveShipImage(
  images: ShipImages | null | undefined,
  view: ShipImageView = 'angled',
): string {
  if (!images) return getShipPlaceholder();

  // Map view name to field keys (prefer full resolution, fall back to medium)
  const viewMap: Record<ShipImageView, (keyof ShipImages)[]> = {
    angled: ['angledView', 'angledViewMedium'],
    side: ['sideView', 'sideViewMedium'],
    top: ['topView', 'topViewMedium'],
    front: ['frontView', 'frontViewMedium'],
    store: ['store'],
    fleetchart: ['fleetchartImage'],
  };

  // Try requested view
  const candidates = viewMap[view];
  for (const key of candidates) {
    const url = images[key];
    if (url) return url;
  }

  // Fallback chain: angled -> store -> placeholder
  if (view !== 'angled' && images.angledView) return images.angledView;
  if (images.store) return images.store;

  return getShipPlaceholder();
}
```

### Pattern 3: Next.js remotePatterns for FleetYards CDN

**What:** Configure `next.config.js` to allow the Next.js Image component to load images from `cdn.fleetyards.net`.
**Source:** [Next.js Image Component docs](https://nextjs.org/docs/app/api-reference/components/image)

**Configuration:**
```javascript
// next.config.js (at project root)
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.fleetyards.net',
      pathname: '/uploads/**',
    },
    {
      protocol: 'https',
      hostname: 'images.aydocorp.space',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'aydocorp.space',
      pathname: '/images/**',
    },
  ],
}
```

### Pattern 4: Graceful Image Fallback with onError

**What:** Handle FleetYards CDN failures by falling back to a local placeholder.
**When to use:** Any `<Image>` component displaying ship images from external CDN.

**Example:**
```tsx
const [imgSrc, setImgSrc] = useState(resolvedUrl);

<Image
  src={imgSrc}
  alt={alt}
  onError={() => setImgSrc('/assets/ship-placeholder.png')}
  onLoad={() => setLoaded(true)}
  // ...
/>
```

### Anti-Patterns to Avoid
- **Removing `image` field from types in Phase 4:** This would break 7+ component files that still reference `ship.image`. That cleanup belongs in Phase 6/7.
- **Passing ship name to new `resolveShipImage`:** The whole point is to move away from name-based resolution to document-based resolution. The new function accepts `ShipImages`, not a string.
- **Using `domains` in next.config.js:** `domains` is deprecated since Next.js 14; use `remotePatterns` instead.
- **Hard-coding CDN URL patterns:** The URLs are already stored in `ShipDocument.images` by the sync engine. The resolution function should use those stored URLs, not construct URLs from ship names.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CDN URL construction | Template-based URL builder for FleetYards | Use URLs from `ShipDocument.images` | FleetYards URLs have UUIDs and hashes in the path; they are not predictable from ship name/slug alone |
| Image fallback chain | Custom error retry logic | `useState` + `onError` pattern | Standard React pattern; Next.js Image `onError` fires once per src change |
| External image allowlist | Custom image proxy | `next.config.js remotePatterns` | Next.js built-in; handles optimization, caching, and security |

**Key insight:** FleetYards CDN URLs are opaque -- they contain upload UUIDs and content hashes (e.g., `https://cdn.fleetyards.net/uploads/model/angled_view/51/82/cac5-a365-4e02-831a-773c79026407/angled-fleetchart-3a16ef8a.png`). You cannot construct them from a ship name. They must be stored in the database and read from `ShipDocument.images`.

## Common Pitfalls

### Pitfall 1: Missing next.config.js at Project Root
**What goes wrong:** `next.config.js` was moved to `scripts/next.config.js` in commit `2ea1e1b`. There is currently NO config file at the project root. Next.js runs with all defaults -- which means `remotePatterns` is empty, images are unoptimized by default, and external CDN images will fail.
**Why it happens:** The file was accidentally moved during a refactor that relocated other scripts.
**How to avoid:** Phase 4 must restore `next.config.js` to the project root. Use the content from `scripts/next.config.js` as the base, adding the FleetYards CDN pattern.
**Warning signs:** `Error: Invalid src prop` in browser console when using `next/image` with FleetYards URLs.

### Pitfall 2: Breaking Existing Components by Removing `image` Field
**What goes wrong:** Making `image` field required-removed from `UserShip` or `MissionShip` would cause TypeScript errors in 7+ component files that still reference `ship.image`.
**Why it happens:** Phase 4 is tempted to "do the full cleanup" but Phases 5-7 haven't rewired components yet.
**How to avoid:** Make `image` optional (`image?: string`) but do NOT remove it. Add `fleetyardsId: string` as the new required field. Components will gradually migrate in Phases 5-6.
**Warning signs:** `npm run type-check` fails with `Property 'image' does not exist` errors in component files.

### Pitfall 3: Profile API Validation Rejects Ships Without `image`
**What goes wrong:** The profile API (`src/app/api/profile/route.ts`) validates that each ship has `manufacturer`, `name`, AND `image` (line 105). If `image` becomes optional in the type but the API still requires it, new ship additions will fail.
**Why it happens:** Zod schema and manual validation in the API route enforce `image: z.string()`.
**How to avoid:** Update the profile API's Zod schema to make `image` optional and add `fleetyardsId` as required. Update the manual validation check on line 105 to check for `fleetyardsId` instead of (or in addition to) `image`.
**Warning signs:** 400 errors when saving user profile with ships.

### Pitfall 4: Planned Missions API Validation Requires `image`
**What goes wrong:** The planned missions API (`src/app/api/planned-missions/route.ts` line 89) validates `ship.image` is a string. If the `image` field is no longer populated for new ships, validation fails.
**Why it happens:** Same as pitfall 3 -- API validation was written when `image` was the primary field.
**How to avoid:** Update validation to accept ships that have `fleetyardsId` even if `image` is missing.
**Warning signs:** 400 errors when creating planned missions with new ship data.

### Pitfall 5: Planned Mission MissionShip idempotency issue from Phase 3
**What goes wrong:** Phase 3 verification noted that `fleetyardsId` may not persist on MissionShip subdocuments (3/4 planned missions re-updated on second migration run).
**Why it happens:** The migration adds `fleetyardsId` to the ship objects, but the MissionShip type definition doesn't include it, so it may be stripped during subsequent saves.
**How to avoid:** Adding `fleetyardsId` to the `MissionShip` type definition (TYPE-02) fixes this by making it a recognized field that won't be stripped.
**Warning signs:** Running the migration script shows previously-migrated planned missions being updated again.

### Pitfall 6: `onLoadingComplete` is Deprecated in Next.js 15
**What goes wrong:** The existing `ShipImage` component uses `onLoadingComplete` which was deprecated in Next.js 14 and marked for removal.
**Why it happens:** Component was written before the deprecation.
**How to avoid:** Use `onLoad` instead: `onLoad={(e) => { ... }}`. The callback receives a standard React event instead of the img element directly.
**Warning signs:** Deprecation warnings in build output; potential removal in future Next.js versions.

## Code Examples

### Example 1: Updated UserShip Type
```typescript
// src/types/user.ts
export interface UserShip {
  manufacturer: string;
  name: string;
  fleetyardsId: string;   // NEW: FleetYards UUID
  image?: string;          // CHANGED: optional (was required)
}
```

### Example 2: Updated MissionShip Type
```typescript
// src/types/PlannedMission.ts
export interface MissionShip {
  shipName: string;
  manufacturer: string;
  size: string;
  role?: string[];
  image?: string;            // CHANGED: optional (was required)
  fleetyardsId: string;     // NEW: FleetYards UUID
  quantity: number;
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
}
```

### Example 3: Updated MissionParticipant Type
```typescript
// src/types/Mission.ts
export interface MissionParticipant {
  userId: string;
  userName: string;
  shipId?: string;
  shipName?: string;
  shipType?: string;
  manufacturer?: string;
  fleetyardsId?: string;    // NEW: FleetYards UUID (optional -- not all participants have ships)
  image?: string;            // Kept optional as before
  crewRequirement?: number;
  isGroundSupport?: boolean;
  roles: string[];
}
```

### Example 4: Updated OperationParticipant Type
```typescript
// src/types/Operation.ts
export interface OperationParticipant {
  userId: string;
  shipName?: string;
  shipManufacturer?: string;
  fleetyardsId?: string;    // NEW: FleetYards UUID (optional)
  role: string;
  notes?: string;
}
```

### Example 5: New resolveShipImage Function
```typescript
// src/lib/ships/image.ts

export type ShipImageView = 'angled' | 'side' | 'top' | 'front' | 'store' | 'fleetchart';

export type ShipImages = {
  store: string | null;
  angledView: string | null;
  angledViewMedium: string | null;
  sideView: string | null;
  sideViewMedium: string | null;
  topView: string | null;
  topViewMedium: string | null;
  frontView: string | null;
  frontViewMedium: string | null;
  fleetchartImage: string | null;
};

export function resolveShipImage(
  images: ShipImages | null | undefined,
  view: ShipImageView = 'angled',
): string {
  if (!images) return getShipPlaceholder();

  const viewMap: Record<ShipImageView, (keyof ShipImages)[]> = {
    angled: ['angledView', 'angledViewMedium'],
    side: ['sideView', 'sideViewMedium'],
    top: ['topView', 'topViewMedium'],
    front: ['frontView', 'frontViewMedium'],
    store: ['store'],
    fleetchart: ['fleetchartImage'],
  };

  const candidates = viewMap[view];
  for (const key of candidates) {
    const url = images[key];
    if (url) return url;
  }

  // Fallback chain: angled -> store -> placeholder
  if (view !== 'angled' && images.angledView) return images.angledView;
  if (images.store) return images.store;

  return getShipPlaceholder();
}

export function getShipPlaceholder(): string {
  return '/assets/ship-placeholder.png';
}
```

### Example 6: next.config.js with FleetYards CDN
```javascript
// next.config.js (at project root -- MUST be restored from scripts/next.config.js)
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.fleetyards.net',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.aydocorp.space',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aydocorp.space',
        pathname: '/images/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (!Array.isArray(config.externals)) {
        config.externals = config.externals ? [config.externals] : [];
      }
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
        'zlib-sync': 'commonjs zlib-sync',
      });
    } else {
      config.resolve = config.resolve || {};
      const existingFallback = config.resolve.fallback || {};
      config.resolve.fallback = {
        ...existingFallback,
        'zlib-sync': false,
        'utf-8-validate': false,
        'bufferutil': false,
      };
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/dashboard/operations/traderoutes',
        destination: '/dashboard/operations',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:all*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Example 7: Updated Profile API Validation
```typescript
// src/app/api/profile/route.ts -- Updated Zod schema
const userShipSchema = z.object({
  manufacturer: z.string(),
  name: z.string(),
  fleetyardsId: z.string().uuid(),
  image: z.string().optional(),   // Now optional
});

// Manual validation update (line ~105):
if (!ship.manufacturer || !ship.name || !ship.fleetyardsId) {
  // reject
}
```

## Detailed File Impact Analysis

### Files to Modify

| File | Change | Requirement |
|------|--------|-------------|
| `src/types/user.ts` | Add `fleetyardsId: string`, make `image` optional | TYPE-01 |
| `src/types/PlannedMission.ts` | Add `fleetyardsId: string` to `MissionShip`, make `image` optional | TYPE-02 |
| `src/types/Mission.ts` | Add `fleetyardsId?: string` to `MissionParticipant` | TYPE-03 |
| `src/types/Operation.ts` | Add `fleetyardsId?: string` to `OperationParticipant` | TYPE-04 |
| `next.config.js` (project root) | Create/restore with FleetYards CDN `remotePatterns` | TYPE-05 |
| `src/lib/ships/image.ts` | Rewrite `resolveShipImage()` to accept images object + view angle | TYPE-06 |
| `src/app/api/profile/route.ts` | Update Zod schema and validation for `fleetyardsId` | TYPE-01 (downstream) |
| `src/app/api/planned-missions/route.ts` | Update ship validation to accept `fleetyardsId` | TYPE-02 (downstream) |
| `src/types/PlannedMission.ts` | Update `shipDetailsToMissionShip()` helper | TYPE-02 (downstream) |
| `src/types/mission-builder.ts` | Add `fleetyardsId?: string` to `MissionParticipantDraft` | TYPE-03 (downstream) |

### Files NOT to Modify (Deferred to Phase 6-7)

These files reference `ship.image` or old image resolution functions but should NOT be changed in Phase 4:

| File | Why Deferred |
|------|-------------|
| `src/components/UserFleetBuilder.tsx` | Phase 6: Full rewire to use new ship API |
| `src/components/mission/ShipImage.tsx` | Phase 6: Rewire to accept `ShipImages` prop instead of `model` string |
| `src/components/dashboard/MissionPlannerForm.tsx` | Phase 6: Uses `ship.image` from ShipDetails |
| `src/components/dashboard/MissionPlanner.tsx` | Phase 6: Uses `ship.image` |
| `src/components/fleet-ops/mission-planner/MissionForm.tsx` | Phase 6: Heavy image usage |
| `src/components/fleet-ops/mission-planner/MissionComposer.tsx` | Phase 6: Heavy image usage |
| `src/types/ShipData.ts` | Phase 7: Full removal of legacy code |
| `src/lib/ship-data.ts` | Phase 7: Full removal of legacy loader |
| `src/lib/cdn.ts` | Phase 7: May be retained for non-ship images |

## FleetYards CDN URL Structure

**Confirmed via live API fetch (HIGH confidence):**

FleetYards CDN URLs follow this pattern:
```
https://cdn.fleetyards.net/uploads/model/{image_type}/{uuid_split}/{filename}
```

Example URLs for Aurora MR:
- **Store:** `https://cdn.fleetyards.net/uploads/model/store_image/51/82/cac5-a365-4e02-831a-773c79026407/StarCitizen_AuroraMR_Shipwall_Crop_4k-171e9a89.jpg`
- **Angled:** `https://cdn.fleetyards.net/uploads/model/angled_view/51/82/cac5-a365-4e02-831a-773c79026407/angled-fleetchart-3a16ef8a.png`
- **Side:** `https://cdn.fleetyards.net/uploads/model/side_view/51/82/cac5-a365-4e02-831a-773c79026407/side-fleetchart-c0dc7e69.png`
- **Top:** `https://cdn.fleetyards.net/uploads/model/top_view/51/82/cac5-a365-4e02-831a-773c79026407/top-fleetchart-f1a26f42.png`

Key observations:
- All URLs are under `cdn.fleetyards.net/uploads/**`
- URLs contain UUIDs and content hashes -- they are NOT constructable from ship name/slug
- The `angledView` is the most commonly available view for most ships
- `frontView` is often null (not all ships have front views)
- Store images are JPG; view images are PNG
- Medium-resolution variants exist (stored in `ShipDocument.images.*Medium` fields)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next/image` `onLoadingComplete` | `onLoad` callback | Next.js 14 (deprecated) | ShipImage component should migrate |
| `images.domains` config | `images.remotePatterns` config | Next.js 14 (deprecated) | Use remotePatterns for FleetYards CDN |
| Name-based image resolution | Document-based image resolution | Phase 4 (this phase) | resolveShipImage() signature changes |

**Deprecated/outdated:**
- `onLoadingComplete` on `<Image>`: Deprecated in Next.js 14, use `onLoad` instead
- `images.domains` in next.config.js: Deprecated in Next.js 14, use `remotePatterns`

## Open Questions

1. **Should the old `resolveShipImage(model: string)` signature be kept as a legacy overload?**
   - What we know: The current function is used in 3 components (ShipImage, UserFleetBuilder, MissionComposer). Phase 6 rewires these.
   - What's unclear: Whether keeping the old signature as a named export avoids breaking Phase 5 work happening in parallel.
   - Recommendation: Rename old function to `resolveShipImageLegacy()` and export both. The new function takes `ShipImages`, the legacy takes a string. Phase 7 removes the legacy version.

2. **Should `image` be removed or kept optional on `MissionShip`?**
   - What we know: The planned missions API (line 89) currently requires `ship.image` as a string.
   - What's unclear: Whether any other storage layer strips unknown fields (which could drop `fleetyardsId` if not in the type).
   - Recommendation: Keep `image?: string` (optional) and add `fleetyardsId: string` (required). Update API validation to require `fleetyardsId` instead of `image`.

## Sources

### Primary (HIGH confidence)
- **Codebase files read directly:** `src/types/user.ts`, `src/types/Mission.ts`, `src/types/Operation.ts`, `src/types/PlannedMission.ts`, `src/types/ship.ts`, `src/types/ShipData.ts`, `src/types/mission-builder.ts`, `src/lib/ships/image.ts`, `src/lib/ship-data.ts`, `src/lib/cdn.ts`, `src/lib/fleetyards/transform.ts`, `src/lib/fleetyards/types.ts`, `src/app/api/profile/route.ts`, `src/app/api/planned-missions/route.ts`, `src/components/mission/ShipImage.tsx`, `src/components/UserFleetBuilder.tsx`, `src/components/fleet-ops/mission-planner/MissionComposer.tsx`, `src/components/fleet-ops/mission-planner/MissionForm.tsx`, `scripts/next.config.js`
- **FleetYards live API:** `https://api.fleetyards.net/v1/models/aurora-mr` -- confirmed CDN URL pattern
- **Git history:** `git log` and `git show 2ea1e1b` confirmed next.config.js was moved from root to scripts/

### Secondary (MEDIUM confidence)
- [Next.js Image Component docs](https://nextjs.org/docs/app/api-reference/components/image) -- remotePatterns configuration
- [Next.js onLoadingComplete deprecation](https://github.com/vercel/next.js/runs/17787522388) -- confirmed deprecated in favor of `onLoad`

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, uses existing project dependencies
- Architecture: HIGH -- based on direct codebase investigation of all affected files
- Type changes: HIGH -- exact current types read, exact changes identified
- Image resolution: HIGH -- FleetYards CDN URLs verified via live API fetch
- next.config.js issue: HIGH -- confirmed via git history and filesystem check
- Pitfalls: HIGH -- derived from reading actual validation code in API routes

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days -- stable domain, types and config rarely change)
