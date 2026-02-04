# Phase 7: Cleanup & Decommission - Research

**Researched:** 2026-02-04
**Domain:** Legacy code removal, dead code detection, build system fixes (Next.js 15.3.3)
**Confidence:** HIGH (direct codebase analysis -- all findings verified against actual source files)

## Summary

Phase 7 is a pure removal/cleanup phase. Research focused on mapping every legacy file, every import chain, every reference to old identifiers, and the exact nature of the build failures that must be fixed. The codebase was directly analyzed to produce an exhaustive inventory.

The legacy ship system consists of three core files (`public/data/ships.json`, `src/lib/ship-data.ts`, `src/types/ShipData.ts`) plus one test utility (`src/types/test-dedup.js`), with import chains reaching into 6 consumer files across the mission planner, fleet builder, and image resolution subsystems. The new system (`src/types/ship.ts`, `src/lib/ships/image.ts`, `src/lib/ships/mappers.ts`) is already fully wired into Phase 5/6 components.

The "discord.js/zlib-sync build failure" described in STATE.md has already been partially addressed by webpack externals in `next.config.js`. The actual current build failure is ESLint-related: `.eslintrc.json` extends `next/core-web-api` (which does not exist as a named config in eslint-config-next) and the `@typescript-eslint` plugin is not loaded, causing `eslint-disable` comments referencing `@typescript-eslint` rules to error with "Definition for rule was not found."

**Primary recommendation:** Execute removals in dependency-leaf-first order (data files first, then consumers, then utility files), fix ESLint config to either extend `next/core-web-vitals` or add `next/typescript`, replace all `/assets/ship-placeholder.png` references with CSS-only placeholders, and verify with a full `npm run build`.

## Standard Stack

This phase does NOT introduce new libraries. It removes code and fixes build configuration.

### Tools Used (Already in Project)
| Tool | Version | Purpose | Why Relevant |
|------|---------|---------|-------------|
| Next.js | 15.3.3 | Build system | `npm run build` is the final verification gate |
| ESLint | ^8.57.0 | Lint checks | Build fails on lint errors; config must be fixed |
| eslint-config-next | 15.3.3 | Next.js ESLint rules | Current config extends invalid `next/core-web-api` |
| TypeScript | ^5.8.3 | Type checking | Removing files must not break type imports |

### Files to Remove (Complete Inventory)
| File | Size | What It Contains |
|------|------|------------------|
| `public/data/ships.json` | ~200+ ships | Static ship database (replaced by MongoDB) |
| `src/lib/ship-data.ts` | 41 lines | `loadShipDatabase()`, `getShipDatabaseSync()`, `isShipDatabaseLoaded()`, `clearShipCache()` |
| `src/types/ShipData.ts` | 535 lines | `ShipDetails`, `Ship`, `ShipManufacturer`, `formatShipImageName()`, `getShipImagePath()`, `getDirectImagePath()`, `shipDatabase`, `shipManufacturers[]`, `MANUFACTURERS`, `getShipByName()`, `getShipsByManufacturer()`, `getDetailedShipsByManufacturer()`, `getShipsByType()`, `getShipsBySize()`, `getShipsByRole()`, `getManufacturersList()`, `_populateShipDatabaseCache()` |
| `src/types/test-dedup.js` | 57 lines | Test script that reads ShipData.ts to find duplicate ship names |
| `public/assets/ship-placeholder.png` | image | Local ship placeholder image (decision: remove, use CSS-only) |

### Files to Modify (Complete Inventory)

**Direct importers of `@/types/ShipData`:**

| File | What It Imports | Action |
|------|----------------|--------|
| `src/lib/ship-data.ts` | `ShipDetails`, `_populateShipDatabaseCache`, `getShipImagePath` | DELETE ENTIRE FILE |
| `src/lib/ships/image.ts` | `getDirectImagePath`, `getShipByName` | Remove legacy import and `resolveShipImageLegacy()` function; update `getShipPlaceholder()` to return CSS class or empty string |
| `src/components/fleet-ops/mission-planner/MissionForm.tsx` | `getShipByName`, `getDirectImagePath` | Remove imports, remove usages of legacy functions |
| `src/components/fleet-ops/mission-planner/MissionComposer.tsx` | `getShipByName`, `getDirectImagePath`, `ShipDetails`; also imports `loadShipDatabase` from `@/lib/ship-data` | Remove legacy imports and usages |
| `src/components/fleet-ops/mission-planner/TestShipImages.tsx` | `ShipDetails`; also imports `loadShipDatabase` | DELETE ENTIRE FILE (test utility for old system) |
| `src/components/dashboard/MissionPlanner.tsx` | `ShipDetails`; also imports `loadShipDatabase` from `@/lib/ship-data` | Remove legacy imports and usages |
| `src/types/PlannedMission.ts` | `ShipDetails` from `./ShipData` | Remove import; remove `shipDetailsToMissionShip()` helper function (superseded by `shipDocumentToMissionShip()` in `src/lib/ships/mappers.ts`) |

**Ship placeholder references to update:**

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `src/components/UserFleetBuilder.tsx` | 121 | `'/assets/ship-placeholder.png'` | CSS-only placeholder |
| `src/components/dashboard/MissionPlannerForm.tsx` | 632 | `'/assets/ship-placeholder.png'` | CSS-only placeholder |
| `src/components/ships/ShipCard.tsx` | 44 | `'/assets/ship-placeholder.png'` | CSS-only placeholder |
| `src/components/ships/ShipCardList.tsx` | 35 | `'/assets/ship-placeholder.png'` | CSS-only placeholder |
| `src/lib/ships/image.ts` | 111 | `'/assets/ship-placeholder.png'` | CSS-only placeholder constant |
| `src/components/fleet-ops/mission-planner/MissionForm.tsx` | 956 | `'/images/ship-placeholder.jpg'` | CSS-only placeholder |
| `src/components/dashboard/MissionPlanner.tsx` | 640, 957 | `'/images/placeholder-ship.png'` | CSS-only placeholder |

### No Installation Needed

```bash
# No new packages. Only removal and configuration fixes.
```

## Architecture Patterns

### Pattern 1: Dependency-Leaf-First Removal Order

**What:** Remove files starting from leaves of the import graph (files that nothing else imports), working inward.
**When to use:** Any multi-file deletion where imports create an ordering dependency.

The import graph for legacy ship code:

```
public/data/ships.json
    <- src/lib/ship-data.ts (fetches JSON at runtime)
        <- src/components/dashboard/MissionPlanner.tsx
        <- src/components/fleet-ops/mission-planner/MissionComposer.tsx
        <- src/components/fleet-ops/mission-planner/TestShipImages.tsx

src/types/ShipData.ts
    <- src/lib/ship-data.ts
    <- src/lib/ships/image.ts (resolveShipImageLegacy only)
    <- src/components/fleet-ops/mission-planner/MissionForm.tsx
    <- src/components/fleet-ops/mission-planner/MissionComposer.tsx
    <- src/components/fleet-ops/mission-planner/TestShipImages.tsx
    <- src/components/dashboard/MissionPlanner.tsx
    <- src/types/PlannedMission.ts (ShipDetails type + shipDetailsToMissionShip helper)

src/types/test-dedup.js (standalone, no importers)
```

**Removal order:**
1. Remove leaf consumers first (TestShipImages.tsx, test-dedup.js)
2. Clean imports in remaining consumers (MissionForm, MissionComposer, MissionPlanner, PlannedMission)
3. Remove `resolveShipImageLegacy` from `src/lib/ships/image.ts`
4. Delete `src/lib/ship-data.ts`
5. Delete `src/types/ShipData.ts`
6. Delete `public/data/ships.json`
7. Delete `public/assets/ship-placeholder.png`

### Pattern 2: CSS-Only Ship Placeholder

**What:** Replace `<img src="/assets/ship-placeholder.png">` with a CSS-only empty state.
**When to use:** Anywhere an image error handler falls back to the placeholder PNG.

**Recommended approach:**
```typescript
// In image.ts - update getShipPlaceholder to return empty string
export function getShipPlaceholder(): string {
  return '';  // No image -- components handle empty state via CSS
}
```

```tsx
// In components -- replace image fallback with CSS empty state
// BEFORE:
onError={() => setImgSrc('/assets/ship-placeholder.png')}

// AFTER:
onError={() => setImgError(true)}

// Then in render:
{imgError ? (
  <div className="flex items-center justify-center w-full h-full bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.15)] rounded">
    <span className="text-xs text-[rgba(var(--mg-primary),0.3)]">No image</span>
  </div>
) : (
  <Image src={imgSrc} ... />
)}
```

This matches the pattern already used in `FleetShipPickerModal` (06-02 decision: `"Unresolved ships show 'No image available' placeholder div instead of placeholder image"`).

### Pattern 3: ESLint Config Fix

**What:** Fix the build-breaking ESLint configuration.
**Current problem:** `.eslintrc.json` extends `next/core-web-api` which is not a valid config name in `eslint-config-next@15.3.3`. The valid options are:
- `next` (base)
- `next/core-web-vitals` (recommended)
- `next/typescript` (adds @typescript-eslint rules)

**The actual build errors:**
```
./src/lib/ship-sync.ts
225:3  Error: Definition for rule '@typescript-eslint/no-require-imports' was not found.

./src/scripts/migrate-ship-references.ts
106:9  Error: Definition for rule '@typescript-eslint/no-explicit-any' was not found.
```

These fail because the code uses `// eslint-disable-next-line @typescript-eslint/no-require-imports` but the `@typescript-eslint` plugin is not loaded (the eslint config does not include `next/typescript`).

**Fix:**
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "root": true,
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
```

Alternatively, since these are `eslint-disable` comments (not rules being enforced), a simpler fix is to remove or update those comments:
- `ship-sync.ts` line 225: Remove the disable comment (the rule won't fire anyway without the plugin)
- `migrate-ship-references.ts` line 106: Remove the disable comment

**Recommended:** Use `next/core-web-vitals` (fixing the typo) and either add `next/typescript` or remove the stale disable comments. Adding `next/typescript` is cleaner long-term.

### Anti-Patterns to Avoid
- **Removing files without cleaning imports first:** TypeScript will catch this, but it creates confusing cascading errors. Clean imports before deleting the source.
- **Replacing placeholder PNG with another PNG:** The decision is CSS-only. Do not create a new placeholder image.
- **Modifying legacy components that use old patterns:** Components like MissionForm.tsx and MissionComposer.tsx use `getShipByName()` and `getDirectImagePath()` from the old system. These imports must be removed, but the components themselves may still reference ship images through other means. Understand what each usage does before removing.
- **Removing the CDN helper (`src/lib/cdn.ts`):** This file is NOT legacy ship-specific. It is used by 20+ components for general site imagery (banners, logos, hero images). Do NOT remove it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dead import detection | Manual file-by-file review | TypeScript compiler (`npm run type-check`) | TS will error on any import of a deleted file |
| Reference scanning | Manual grep | Automated grep checklist (below) | Consistent, repeatable, catches everything |
| CSS placeholder design | Complex SVG/animation system | Simple div with text + MobiGlas theme colors | Matches existing 06-02 pattern |
| ESLint rule availability | Installing @typescript-eslint manually | Extend `next/typescript` config | eslint-config-next already bundles it |

**Key insight:** The TypeScript compiler is the best dead code detector for this phase. After removing files, `npm run type-check` will surface every broken import. The planner should use this as the primary verification tool between each commit.

## Common Pitfalls

### Pitfall 1: PlannedMission.ts imports ShipDetails for the helper function
**What goes wrong:** `PlannedMission.ts` imports `ShipDetails` from `./ShipData` and uses it in the `shipDetailsToMissionShip()` function. Simply removing the import without removing the function causes a compile error.
**Why it happens:** The type is used as a parameter type in a function that is itself superseded.
**How to avoid:** Remove both the import AND the `shipDetailsToMissionShip()` function. The replacement is `shipDocumentToMissionShip()` in `src/lib/ships/mappers.ts`, which was wired in during Phase 6.
**Warning signs:** TypeScript error on `ShipDetails` type not found in PlannedMission.ts.
**Verification:** Grep for `shipDetailsToMissionShip` -- should have ZERO callers after removal. Currently it is only defined in PlannedMission.ts and has no callers in the codebase (superseded by mappers.ts).

### Pitfall 2: MissionComposer.tsx and MissionPlanner.tsx still call loadShipDatabase()
**What goes wrong:** These components call `loadShipDatabase()` from the old system to populate a ship picker dropdown. Removing `ship-data.ts` breaks them.
**Why it happens:** These are old mission planner components that were NOT rewired during Phase 6 (Phase 6 focused on the NEW MissionPlannerForm and MissionShipPickerModal).
**How to avoid:** These components need their `loadShipDatabase()` calls removed. If they still need ship data, they should use the new `/api/ships` endpoint. However, MissionPlannerForm.tsx (the new version) already uses `MissionShipPickerModal` which hits the API. The old components (MissionComposer, MissionForm, MissionPlanner) may be partially or fully dead code themselves.
**Warning signs:** Components that import both old AND new patterns.
**Verification:** Check if these old mission planner components are actually routed to from any page. If they are dead code, they can be removed entirely.

### Pitfall 3: Multiple different placeholder paths
**What goes wrong:** The codebase has THREE different placeholder image paths scattered across components:
1. `/assets/ship-placeholder.png` (6 references -- the Phase 4 standard)
2. `/images/ship-placeholder.jpg` (1 reference in MissionForm.tsx)
3. `/images/placeholder-ship.png` (2 references in MissionPlanner.tsx)
**Why it happens:** Different components were written at different times with different conventions.
**How to avoid:** Search for ALL three patterns. The grep scan must include all three variants.
**Warning signs:** Build passes but some components show broken images at runtime.
**Verification:** Use the comprehensive identifier grep scan (see Code Examples section).

### Pitfall 4: resolveShipImageLegacy has exactly one live caller
**What goes wrong:** Removing `resolveShipImageLegacy` from `src/lib/ships/image.ts` without updating its caller breaks the `ShipImage` component.
**Why it happens:** `src/components/mission/ShipImage.tsx` imports and calls `resolveShipImageLegacy(model)`.
**How to avoid:** The `ShipImage` component either needs to be: (a) updated to use `resolveShipImage()` with proper `ShipImages` data, or (b) deleted if it is dead code. Check if `ShipImage` is imported anywhere.
**Warning signs:** TypeScript error on missing export from `@/lib/ships/image`.
**Verification:** Grep for `ShipImage` component usage across the codebase.

### Pitfall 5: The CDN helper is NOT ship-specific
**What goes wrong:** Someone removes `src/lib/cdn.ts` thinking it is R2/legacy ship infrastructure.
**Why it happens:** The `cdn()` function references `images.aydocorp.space` and `CLOUDFLARE_R2_BUCKET_URL`, which sounds legacy.
**How to avoid:** Do NOT remove `cdn.ts`. It is used by 20+ components for general site assets (hero images, logos, banners, subsidiary images). Only `ShipData.ts` uses it for ship-specific purposes, and that import chain is removed with ShipData.ts.
**Warning signs:** Half the site's images break.
**Verification:** Grep for `from '@/lib/cdn'` -- should show 20+ components, all for non-ship imagery.

### Pitfall 6: next.config.js images.aydocorp.space remote pattern
**What goes wrong:** Removing the `images.aydocorp.space` remote pattern from `next.config.js` thinking it is legacy.
**Why it happens:** It was used for old R2-hosted ship images, but it also serves general site assets.
**How to avoid:** Keep the `images.aydocorp.space` remote pattern. Components like Navigation.tsx, services page, SubsidiariesTab, etc. reference `https://images.aydocorp.space/` URLs directly for non-ship imagery.
**Warning signs:** Next.js Image optimization errors for site assets.

## Code Examples

### Comprehensive Identifier Grep Scan
```bash
# Run this after all removals to verify zero remaining references.
# Every line should return 0 matches (excluding planning docs).

echo "=== Scanning for legacy identifiers ==="

# Core files (should not exist)
test ! -f public/data/ships.json && echo "PASS: ships.json removed" || echo "FAIL: ships.json still exists"
test ! -f src/lib/ship-data.ts && echo "PASS: ship-data.ts removed" || echo "FAIL: ship-data.ts still exists"
test ! -f src/types/ShipData.ts && echo "PASS: ShipData.ts removed" || echo "FAIL: ShipData.ts still exists"
test ! -f src/types/test-dedup.js && echo "PASS: test-dedup.js removed" || echo "FAIL: test-dedup.js still exists"
test ! -f public/assets/ship-placeholder.png && echo "PASS: ship-placeholder.png removed" || echo "FAIL: ship-placeholder.png still exists"

# Function/identifier references (should be 0 in src/)
grep -r "loadShipDatabase" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "getShipsByManufacturer" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "formatShipImageName" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "getShipImagePath" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "getDirectImagePath" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "shipManufacturers" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "getShipByName" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "resolveShipImageLegacy" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "shipDetailsToMissionShip" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "_populateShipDatabaseCache" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "getShipDatabaseSync" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "isShipDatabaseLoaded" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "clearShipCache" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "ShipDetails" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "ship-placeholder" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "placeholder-ship" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "from.*ShipData" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "from.*ship-data" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "ships\.json" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules

echo "=== Scan complete ==="
```

### ESLint Config Fix
```json
// .eslintrc.json -- fix the invalid "next/core-web-api" extension
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "root": true,
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
```

### CSS-Only Ship Placeholder Pattern
```tsx
// Consistent empty-state pattern for ship images (matches 06-02 FleetShipPickerModal)
// Source: src/components/ships/FleetShipPickerModal.tsx (existing pattern in codebase)

// For components using next/image with onError:
const [imgError, setImgError] = useState(false);

{imgError || !imgSrc ? (
  <div className="flex items-center justify-center w-full h-full bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.15)] rounded">
    <span className="text-xs text-[rgba(var(--mg-primary),0.3)]">No image</span>
  </div>
) : (
  <Image
    src={imgSrc}
    alt={shipName}
    fill
    className="object-cover"
    onError={() => setImgError(true)}
  />
)}
```

### getShipPlaceholder Update
```typescript
// src/lib/ships/image.ts -- after removing legacy section

// Placeholder returns empty string; components should handle empty state via CSS
export function getShipPlaceholder(): string {
  return '';
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static `ships.json` + `loadShipDatabase()` | MongoDB `ships` collection + `/api/ships` endpoint | Phase 1-2 | All new UI fetches from API |
| `getShipImagePath()` / `formatShipImageName()` (R2 CDN) | `resolveShipImage()` (FleetYards CDN URLs from DB) | Phase 4 | Images come from FleetYards CDN, no local generation |
| `ShipDetails` type | `ShipDocument` type from `types/ship.ts` | Phase 4 | Richer data model with Zod validation |
| `getShipByName()` / `getShipsByManufacturer()` | `/api/ships?q=` + `/api/ships/manufacturers` | Phase 2 | Server-side search with filters |
| `shipDetailsToMissionShip()` | `shipDocumentToMissionShip()` in `lib/ships/mappers.ts` | Phase 6 | Uses FleetYards ID, not empty placeholder |
| `/assets/ship-placeholder.png` fallback | CSS-only empty state | Phase 7 (this phase) | No local image dependency |

**Deprecated/outdated (removing this phase):**
- `src/types/ShipData.ts`: Entire file -- all exports superseded
- `src/lib/ship-data.ts`: Entire file -- replaced by API endpoints
- `public/data/ships.json`: Entire file -- replaced by MongoDB
- `resolveShipImageLegacy()`: Replaced by `resolveShipImage()` in Phase 4
- `shipDetailsToMissionShip()`: Replaced by `shipDocumentToMissionShip()` in Phase 6
- `src/types/test-dedup.js`: Utility for old data, no longer relevant

## Open Questions

1. **Are MissionComposer.tsx, MissionForm.tsx, and the old MissionPlanner.tsx actually routed/used?**
   - What we know: They import from the old system (`loadShipDatabase`, `getShipByName`, `getDirectImagePath`). The new `MissionPlannerForm.tsx` was built in Phase 6 and uses the new ship picker.
   - What's unclear: Whether these old components are still rendered by any route or if they are effectively dead code.
   - Recommendation: During execution, check if any page.tsx files import these components. If they are dead code, remove them entirely rather than surgically removing just the legacy imports. If they ARE still used, their legacy imports need to be replaced with API-based equivalents.

2. **Does ShipImage.tsx (the component using resolveShipImageLegacy) have any live callers?**
   - What we know: `src/components/mission/ShipImage.tsx` imports `resolveShipImageLegacy`. It is imported in `MissionComposer.tsx` line 9.
   - What's unclear: Whether MissionComposer itself is live code.
   - Recommendation: If MissionComposer is dead, ShipImage can be removed too. If MissionComposer is live, ShipImage needs to be updated to use `resolveShipImage()` with proper ShipImages data.

3. **Should `images.aydocorp.space` remote pattern stay in next.config.js?**
   - What we know: Multiple non-ship components reference `https://images.aydocorp.space/` URLs directly (Navigation.tsx, services page, SubsidiariesTab.tsx).
   - Recommendation: Keep it. It serves general site assets, not just ship images.

4. **Should the `cdn()` helper's R2 environment variables be cleaned up?**
   - What we know: `cdn.ts` references `NEXT_PUBLIC_IMAGE_BASE_URL`, `CLOUDFLARE_R2_BUCKET_URL`, and `NEXT_PUBLIC_IMAGE_PATH_PREFIX`.
   - What's unclear: Whether these env vars are still needed for production deployment of non-ship assets.
   - Recommendation: Leave `cdn.ts` untouched in this phase. It is used by 20+ components for non-ship imagery. Any R2 cleanup is a separate concern.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all files in `src/` directory
- `npm run build` output showing actual ESLint errors
- `npx eslint --print-config` output confirming plugin availability
- `node_modules/eslint-config-next/` directory listing confirming available configs

### Secondary (MEDIUM confidence)
- [Next.js ESLint Configuration docs](https://nextjs.org/docs/app/api-reference/config/eslint) -- confirmed `next/core-web-vitals` and `next/typescript` as valid config names
- [eslint-config-next npm](https://www.npmjs.com/package/eslint-config-next) -- version 15.3.3 matches project

### Tertiary (LOW confidence)
- None -- all findings verified against actual codebase

## Metadata

**Confidence breakdown:**
- Removal inventory: HIGH -- every file and import chain verified with Grep/Glob against actual codebase
- Build fix (ESLint): HIGH -- actual `npm run build` output captured, root cause confirmed
- Placeholder replacement: HIGH -- existing pattern found in codebase (06-02 FleetShipPickerModal)
- Open questions (old component liveness): MEDIUM -- needs route-level verification during execution

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (stable -- no external dependencies, all findings are internal codebase state)
