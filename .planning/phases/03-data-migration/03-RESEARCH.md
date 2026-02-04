# Phase 3: Data Migration - Research

**Researched:** 2026-02-03
**Domain:** MongoDB data migration, name-to-UUID resolution, multi-collection batch updates
**Confidence:** HIGH

## Summary

This phase migrates all existing ship references across four entity types (users, missions, operations, resources) from human-readable name strings to FleetYards UUID identifiers. The migration is a standalone Node.js script that reads from the `ships` collection (populated by Phase 1) and updates documents across multiple MongoDB collections and local JSON fallback files.

The core challenge is **name matching**: the codebase uses ship names from a hand-maintained `ShipData.ts` list that has known discrepancies with FleetYards canonical names. Research identified at least 5 concrete naming mismatches between codebase names and FleetYards names. A multi-pass matching strategy with a manual override map is required to achieve the 100% match rate success criterion.

The migration must handle the hybrid storage system: users exist in MongoDB AND local JSON (`data/users.json`), operations exist primarily in local JSON (`data/operations.json`), while missions use MongoDB. Resources exist only in local JSON. Each storage backend requires separate read/write logic in the migration script.

**Primary recommendation:** Build the migration as a single script with modular matchers, running collection-by-collection with per-document error handling. Build the name-matching engine first, validate it against a complete inventory of all unique ship names in the system, then run the actual migration.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| mongodb | 6.x (already installed) | Direct MongoDB collection access | Already used by ship-storage.ts and mongodb-client.ts |
| dotenv | (already installed) | Load .env.local for DB credentials | Existing pattern from migrate-users.ts |
| fs/path | Node built-in | Read/write local JSON fallback files | Existing pattern from all storage modules |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 3.x (already installed) | Validate migration input/output shapes | Already used for ship schemas |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct MongoDB driver | mongoose | Mongoose adds ORM overhead; the project already uses raw mongodb driver everywhere |
| Custom migration script | migrate-mongo / mongosh scripts | Extra dependency for a one-time migration; the project already has custom script pattern |
| Levenshtein fuzzy matching | fuse.js or string-similarity npm | Over-engineering for ~200 known ship names; a simple slug/contains matcher suffices |

**Installation:**
```bash
# No new dependencies needed -- everything is already in the project
```

## Architecture Patterns

### Recommended Project Structure
```
src/scripts/
  migrate-ship-references.ts    # Main migration entry point
src/lib/
  ship-name-matcher.ts          # Name matching engine (reusable)
```

### Pattern 1: Collection-Sequential Migration
**What:** Migrate one collection at a time, completing all documents in a collection before moving to the next.
**When to use:** Always -- this is the only pattern that allows per-collection progress tracking and partial recovery.
**Example:**
```typescript
// Source: Existing migrate-users.ts pattern in this codebase
async function main() {
  const ships = await loadShipsLookup();  // Build name -> UUID map from ships collection

  const report: MigrationReport = {
    startedAt: new Date().toISOString(),
    collections: {},
    totalProcessed: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
    unmatchedNames: [],
  };

  // Phase 1: Users (MongoDB + local JSON)
  await migrateUserShips(ships, report);

  // Phase 2: Missions (MongoDB)
  await migrateMissionShips(ships, report);

  // Phase 3: Operations (local JSON primarily)
  await migrateOperationShips(ships, report);

  // Phase 4: Resources (local JSON)
  await migrateResourceShips(ships, report);

  // Phase 5: Planned Missions (MongoDB)
  await migratePlannedMissionShips(ships, report);

  printReport(report);
}
```

### Pattern 2: Multi-Pass Name Matching
**What:** Try increasingly fuzzy matching strategies in order until a match is found or all strategies are exhausted.
**When to use:** For every ship name resolution.
**Example:**
```typescript
type MatchStrategy = 'exact' | 'case-insensitive' | 'slug' | 'rsi-name' | 'contains' | 'manual-override';

interface MatchResult {
  fleetyardsId: string;
  matchedName: string;
  strategy: MatchStrategy;
}

function resolveShipName(
  name: string,
  shipsIndex: ShipsIndex,
  overrides: Record<string, string>
): MatchResult | null {
  // Pass 1: Manual override (highest priority -- known fixes)
  if (overrides[name]) {
    const ship = shipsIndex.byFleetyardsId.get(overrides[name]);
    if (ship) return { fleetyardsId: ship.fleetyardsId, matchedName: ship.name, strategy: 'manual-override' };
  }

  // Pass 2: Exact name match
  const exact = shipsIndex.byName.get(name);
  if (exact) return { fleetyardsId: exact.fleetyardsId, matchedName: exact.name, strategy: 'exact' };

  // Pass 3: Case-insensitive match
  const lower = name.toLowerCase();
  const ci = shipsIndex.byNameLower.get(lower);
  if (ci) return { fleetyardsId: ci.fleetyardsId, matchedName: ci.name, strategy: 'case-insensitive' };

  // Pass 4: Slug match (convert name to slug format)
  const slug = nameToSlug(name);
  const slugMatch = shipsIndex.bySlug.get(slug);
  if (slugMatch) return { fleetyardsId: slugMatch.fleetyardsId, matchedName: slugMatch.name, strategy: 'slug' };

  // Pass 5: Contains match (name is substring or superstring)
  for (const [, ship] of shipsIndex.byName) {
    if (ship.name.toLowerCase().includes(lower) || lower.includes(ship.name.toLowerCase())) {
      return { fleetyardsId: ship.fleetyardsId, matchedName: ship.name, strategy: 'contains' };
    }
  }

  return null;
}
```

### Pattern 3: Idempotent Document Update
**What:** Check if document already has a valid fleetyardsId before attempting migration. Skip already-migrated documents.
**When to use:** Every document update to satisfy MIG-06 (idempotent).
**Example:**
```typescript
function needsMigration(ship: { fleetyardsId?: string; name: string }): boolean {
  // Already migrated if fleetyardsId is present and is a valid UUID
  if (ship.fleetyardsId && UUID_REGEX.test(ship.fleetyardsId)) {
    return false;
  }
  return true;
}
```

### Anti-Patterns to Avoid
- **Bulk replaceAll:** Never replace all documents at once. Update one at a time with per-document error handling.
- **In-place field removal:** Do NOT remove the `name` field during migration. Add `fleetyardsId` alongside existing fields. Phase 4 handles type cleanup.
- **Cross-collection transactions:** Cosmos DB cannot transact across collections. Do not attempt multi-collection atomic operations.
- **Silent name matching failures:** Every unmatched name must be reported in the migration output, never silently dropped.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Name-to-slug conversion | Custom slug function | Replicate FleetYards slug pattern: `name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')` | Must match FleetYards slug format exactly |
| MongoDB connection | New connection logic | `connectToDatabase()` from `src/lib/mongodb.ts` | Already handles Cosmos DB config, pooling, retries |
| User storage access | Direct collection access for users | `src/lib/user-storage.ts` functions (`getAllUsers`, `updateUser`) | Handles MongoDB/local fallback automatically |
| UUID validation | Custom regex | `const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` | Already defined in ship-storage.ts |

**Key insight:** The migration script should use existing storage modules for users (which handle fallback), but must use direct MongoDB access for missions and planned missions (which go directly to MongoDB), and direct fs access for operations and resources (which go to local JSON files).

## Common Pitfalls

### Pitfall 1: Name Mismatches Between Codebase and FleetYards
**What goes wrong:** The hardcoded ship names in `ShipData.ts` (used for user ship selection) do not match FleetYards canonical names exactly.
**Why it happens:** The codebase ship list was hand-maintained and has drifted from FleetYards naming.
**Confirmed discrepancies found during research:**

| Codebase Name | FleetYards Name | Type of Mismatch |
|---------------|-----------------|------------------|
| `Ares Star Fighter Inferno` | `Ares Inferno` | Extra words removed |
| `Ares Star Fighter Ion` | `Ares Ion` | Extra words removed |
| `C8R Pisces Rescue` | `C8R Pisces` | Suffix removed |
| `Gladius Pirate` | `Gladius Pirate Edition` | Missing suffix |
| `F7C M Super Hornet Mk II` | `F7C-M Super Hornet Mk II` | Space vs hyphen |
| `F7C-M Hornet Heartseeker Mk II` | Not found in FY | May not exist in FleetYards |
| `F8C Lightening` | `F8C Lightning` | Misspelling in codebase |
| `Hammerhead Best In Show Edition` | Not found (empty result) | May not exist in FleetYards |
| `Reclaimer Best In Show Edition` | Not found (empty result) | May not exist in FleetYards |
| `Cutlass Black Best In Show Edition` | Not found (empty result) | May not exist in FleetYards |
| `Caterpillar Best In Show Edition` | Not found (empty result) | May not exist in FleetYards |
| `Caterpillar Pirate Edition` | Not found (needs verification) | May not exist in FleetYards |
| `Constellation Phoenix Emerald` | Not found (needs verification) | May not exist in FleetYards |

**How to avoid:** Build the manual override map FIRST with all known discrepancies. The overrides map is keyed by codebase name and valued by FleetYards UUID.

**Warning signs:** Migration report shows >0 unmatched names.

### Pitfall 2: Forgetting the Hybrid Storage System
**What goes wrong:** Migration only updates MongoDB and misses data in local JSON files (or vice versa).
**Why it happens:** Different entity types use different storage backends.
**How to avoid:** The migration must handle BOTH backends:

| Collection | Primary Storage | Fallback Storage | Migration Approach |
|------------|----------------|------------------|-------------------|
| Users | MongoDB (via user-storage.ts) | `data/users.json` | Use `user-storage.ts` API which handles both |
| Missions | MongoDB (missions collection) | `data/missions.json` (exists but empty) | Direct MongoDB + local JSON |
| Operations | Local JSON (always falls back) | `data/operations.json` | Direct fs read/write |
| Resources | Local JSON (always falls back) | `data/resources.json` | Direct fs read/write |
| Planned Missions | MongoDB (planned-missions) | Local JSON | Direct MongoDB + local JSON |

**Critical observation from codebase analysis:** The `operation-storage.ts` and `resource-storage.ts` modules have MongoDB "TODO" stubs that always fall back to local JSON. This means operations and resources are LOCAL JSON ONLY in the current codebase.

### Pitfall 3: Modifying Document Shape Prematurely
**What goes wrong:** Migration removes fields or changes types that downstream code still reads.
**Why it happens:** Temptation to "clean up" during migration.
**How to avoid:** This migration ONLY ADDS the `fleetyardsId` field. It does NOT:
- Remove the existing `name`, `shipName`, `manufacturer`, or `image` fields
- Change any existing field types
- Restructure nested objects

Phase 4 (Type System) handles the type changes after migration proves all IDs resolve correctly.

### Pitfall 4: Migration Script Cannot Run in Node.js (Path Alias Issue)
**What goes wrong:** The migration script uses `@/` path aliases that only work in the Next.js build context, not in direct `ts-node` / `tsx` execution.
**Why it happens:** Scripts in `src/scripts/` use `@/lib/user-storage` imports but are run with `ts-node` or `tsx` outside Next.js.
**How to avoid:** Check how existing scripts handle this. The existing `migrate-users.ts` uses direct `dotenv` + `@azure/cosmos` without path aliases. The `migrate-timezone.ts` uses `@/lib/user-storage` which means it runs through a tsconfig-paths setup. Use the same approach as `migrate-timezone.ts` which is registered in `package.json` as:
```json
"migrate-timezone": "ts-node -r tsconfig-paths/register --skip-project src/scripts/migrate-timezone.ts"
```

### Pitfall 5: rsiName Field Not Stored in ShipDocument
**What goes wrong:** The multi-pass matcher wants to match against `rsiName` from FleetYards, but the `ShipDocument` type and transform function do NOT store `rsiName`.
**Why it happens:** The Phase 1 transform (`fleetyards/transform.ts`) maps `raw.id` to `fleetyardsId`, `raw.name` to `name`, `raw.slug` to `slug`, but drops `rsiName`, `rsiSlug`, and `rsiId` fields.
**How to avoid:** Two options:
1. **Recommended:** Fetch rsiName directly from FleetYards API during migration build phase (one-time fetch, not stored permanently)
2. Alternative: Add rsiName to ShipDocument and re-sync (requires Phase 1 changes)

For this migration, the matcher can query the FleetYards API directly or use the ships collection fields (name, slug, scIdentifier) which provide sufficient matching surface.

**Research finding:** In every case tested, FleetYards `rsiName` exactly matches FleetYards `name`, so `rsiName` matching is redundant with exact name matching. The `slug` field is the more useful alternate match path.

## Code Examples

Verified patterns from the existing codebase:

### Building the Ships Lookup Index
```typescript
// Load all ships from MongoDB into an in-memory index
import { connectToDatabase } from '@/lib/mongodb';

async function buildShipsIndex(): Promise<ShipsIndex> {
  const { db } = await connectToDatabase();
  const ships = await db.collection('ships')
    .find({}, { projection: { _id: 0, fleetyardsId: 1, name: 1, slug: 1, scIdentifier: 1 } })
    .toArray();

  const byName = new Map<string, ShipRef>();
  const byNameLower = new Map<string, ShipRef>();
  const bySlug = new Map<string, ShipRef>();
  const byFleetyardsId = new Map<string, ShipRef>();

  for (const ship of ships) {
    const ref = { fleetyardsId: ship.fleetyardsId, name: ship.name, slug: ship.slug };
    byName.set(ship.name, ref);
    byNameLower.set(ship.name.toLowerCase(), ref);
    bySlug.set(ship.slug, ref);
    byFleetyardsId.set(ship.fleetyardsId, ref);
  }

  return { byName, byNameLower, bySlug, byFleetyardsId };
}
```

### Migrating User Ships (Following Existing Pattern)
```typescript
// Source: Pattern from migrate-timezone.ts
import * as userStorage from '../lib/user-storage';

async function migrateUserShips(index: ShipsIndex, report: MigrationReport) {
  const users = await userStorage.getAllUsers();
  let updated = 0, skipped = 0, failed = 0;

  for (const user of users) {
    if (!user.ships || user.ships.length === 0) {
      skipped++;
      continue;
    }

    let needsUpdate = false;
    const migratedShips = user.ships.map(ship => {
      if ((ship as any).fleetyardsId && UUID_REGEX.test((ship as any).fleetyardsId)) {
        return ship; // Already migrated
      }
      const match = resolveShipName(ship.name, index, MANUAL_OVERRIDES);
      if (match) {
        needsUpdate = true;
        report.mappings.push({ original: ship.name, resolved: match.matchedName, strategy: match.strategy });
        return { ...ship, fleetyardsId: match.fleetyardsId };
      } else {
        report.unmatchedNames.push({ collection: 'users', userId: user.id, name: ship.name });
        return ship;
      }
    });

    if (needsUpdate) {
      await userStorage.updateUser(user.id, { ships: migratedShips });
      updated++;
    } else {
      skipped++;
    }
  }

  report.collections.users = { total: users.length, updated, skipped, failed };
}
```

### Reading/Writing Local JSON (Following Existing Pattern)
```typescript
// Source: Pattern from operation-storage.ts
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function readJsonFile<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
```

### Manual Override Map
```typescript
// Known name discrepancies between codebase ShipData.ts and FleetYards API
// Key: codebase name, Value: FleetYards UUID or slug
const MANUAL_OVERRIDES: Record<string, string> = {
  // Extra words in codebase name
  'Ares Star Fighter Inferno': 'ares-inferno',  // slug-based override
  'Ares Star Fighter Ion': 'ares-ion',
  'C8R Pisces Rescue': 'c8r-pisces',

  // Missing suffix in codebase
  'Gladius Pirate': 'gladius-pirate-edition',

  // Punctuation differences
  'F7C M Super Hornet Mk II': 'f7c-m-super-hornet-mk-ii',

  // Misspelling in codebase
  'F8C Lightening': 'f8c-lightning',

  // "Best In Show" editions -- may not exist in FleetYards
  // These need verification during dry-run. If they don't exist,
  // map them to the base variant:
  'Hammerhead Best In Show Edition': 'hammerhead',
  'Reclaimer Best In Show Edition': 'reclaimer',
  'Cutlass Black Best In Show Edition': 'cutlass-black',
  'Caterpillar Best In Show Edition': 'caterpillar',
  'Caterpillar Pirate Edition': 'caterpillar',  // verify

  // Special editions that may not exist
  'Constellation Phoenix Emerald': 'constellation-phoenix',  // verify
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static `ShipData.ts` ship list | FleetYards API-synced `ships` collection | Phase 1 (this project) | All ship references can now resolve to UUID |
| R2 CDN image URLs in documents | FleetYards CDN URLs in ShipDocument.images | Phase 1 (this project) | Image URLs from ship docs, not hardcoded |
| `user.ships[].name` as identifier | `user.ships[].fleetyardsId` as identifier | This phase (Phase 3) | UUID is stable across renames |

**Deprecated/outdated:**
- `getShipByName()` in ShipData.ts: Already marked @deprecated, will be replaced by UUID-based lookup
- `shipManufacturers` array in ShipData.ts: Hand-maintained, will be replaced by API in Phase 7

## Data Inventory (What Gets Migrated)

### Collection: Users
**Type:** `User` (src/types/user.ts)
**Ship field:** `user.ships: UserShip[]` where `UserShip = { manufacturer: string; name: string; image: string }`
**Storage:** MongoDB via user-storage.ts (with local JSON fallback)
**Action:** Add `fleetyardsId` to each entry in `ships[]` array
**Local JSON:** `data/users.json` -- 3 test users, none currently have ships assigned
**MongoDB:** Production users -- count unknown until runtime

### Collection: Missions
**Type:** `Mission` (src/types/Mission.ts)
**Ship fields:**
- `mission.participants[].shipName?: string`
- `mission.participants[].shipType?: string`
- `mission.participants[].manufacturer?: string`
- `mission.participants[].shipId?: string`
- `mission.participants[].image?: string`
**Storage:** MongoDB (mission-storage.ts uses connectToDatabase directly)
**Action:** Add `fleetyardsId` to each participant that has a `shipName`
**Local JSON:** `data/missions.json` -- empty array `[]`

### Collection: Operations
**Type:** `Operation` (src/types/Operation.ts)
**Ship fields:**
- `operation.participants[].shipName?: string`
- `operation.participants[].shipManufacturer?: string`
**Storage:** Local JSON ONLY (operation-storage.ts always falls back)
**Action:** Add `fleetyardsId` to each participant that has a `shipName`
**Local JSON:** `data/operations.json` -- empty array `[]`

### Collection: Resources
**Type:** `Resource` (src/types/Resource.ts)
**Ship fields (when type === 'Ship'):**
- `resource.name: string` (ship name)
- `resource.manufacturer?: string`
- `resource.model?: string`
**Storage:** Local JSON ONLY (resource-storage.ts always falls back)
**Action:** Add `fleetyardsId` to resources where `type === 'Ship'`
**Local JSON:** `data/resources.json` -- empty array `[]`

### Collection: Planned Missions
**Type:** `PlannedMission` (src/types/PlannedMission.ts)
**Ship fields:**
- `plannedMission.ships[]: MissionShip[]` where `MissionShip = { shipName, manufacturer, size, role?, image, quantity, assignedTo?, assignedToName?, notes? }`
**Storage:** MongoDB (planned-mission-storage.ts uses connectToDatabase)
**Action:** Add `fleetyardsId` to each entry in `ships[]` array
**Local JSON:** No local JSON file for planned missions

### Critical Observation
**The local JSON data files are currently empty** (missions: `[]`, operations: `[]`, resources: `[]`). Users exist but have no ships assigned in local JSON. This means the actual migration work is primarily against MongoDB production data. However, the migration script MUST still handle both paths because:
1. Production data exists in MongoDB
2. The migration must be correct for both backends in case of future use
3. MIG-06 (idempotent) means the script could run against either backend

## Open Questions

Things that couldn't be fully resolved:

1. **"Best In Show" and limited edition ship variants**
   - What we know: FleetYards search for "Best In Show" returned empty. These variants may not exist in FleetYards.
   - What's unclear: Whether they exist under different names, or genuinely aren't tracked.
   - Recommendation: The manual override map should map these to their base variants (e.g., "Hammerhead Best In Show Edition" -> Hammerhead UUID). Validate during dry-run.

2. **Actual production data volume**
   - What we know: Local JSON has 3 test users with no ships. Production MongoDB data volume is unknown.
   - What's unclear: How many users have ships, how many missions/operations have participants with ships.
   - Recommendation: The migration script should log counts at the start. This is a small org application, so volumes are likely low (dozens of users, handful of missions).

3. **F7C-M Hornet Heartseeker Mk II naming in codebase**
   - What we know: Codebase has `"F7C-M Hornet Heartseeker Mk II"` but FleetYards has `"F7C-M Super Hornet Heartseeker Mk I"`. The "Mk II" version may not exist in FleetYards.
   - What's unclear: Whether this is a codebase error or a real variant not yet in FleetYards.
   - Recommendation: Manual override to map to the closest FleetYards match, with a note in the migration report.

4. **Whether rsiName provides additional matching value**
   - What we know: In all tested cases, FleetYards `rsiName` exactly equals `name`. The `rsiName` field is NOT stored in ShipDocument.
   - What's unclear: Whether there are edge cases where rsiName differs from name.
   - Recommendation: Skip rsiName as a separate matching pass. The existing name + slug + contains strategy is sufficient.

## Sources

### Primary (HIGH confidence)
- **Codebase analysis**: All type files, storage modules, existing migration scripts, ship-storage.ts -- directly read and analyzed
- **FleetYards API live queries**: Verified naming patterns for Constellation, Pisces, Ares, Hornet, F8C, San'tok.yai variants via `api.fleetyards.net/v1/models` with `q[nameCont]` parameter
- **Phase 1 artifacts**: ship.ts (ShipDocument), ship-sync.ts (sync pipeline), fleetyards/transform.ts (field mapping)

### Secondary (MEDIUM confidence)
- **FleetYards "Best In Show" variants**: Empty result from API search -- may not exist or may use different naming. Needs dry-run verification.
- **Prior PITFALLS.md research**: Documented migration risks (name matching, big-bang corruption, CDN dependency) -- previously researched

### Tertiary (LOW confidence)
- **Production data volume**: Unknown without connecting to production MongoDB. Local JSON files are empty/minimal test data only.
- **"F7C-M Hornet Heartseeker Mk II"**: May or may not exist in FleetYards. The Mk I version exists but Mk II status is unverified.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - using existing project dependencies only
- Architecture: HIGH - following established migration script patterns from codebase
- Name matching strategy: HIGH - verified against live FleetYards API with concrete discrepancy list
- Data inventory: HIGH - all types and storage modules read in full
- Manual override completeness: MEDIUM - confirmed major discrepancies but "Best In Show" and some edge cases need dry-run verification
- Production data volume: LOW - only local JSON inspected, MongoDB production data unknown

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (stable -- FleetYards names change slowly with SC patches)
