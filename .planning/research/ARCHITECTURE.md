# Architecture: FleetYards API Sync Integration

**Domain:** Periodic external API data synchronization in a Next.js 15 App Router + MongoDB application
**Researched:** 2026-02-03
**Overall confidence:** HIGH (based on direct codebase analysis + live FleetYards API inspection)

---

## Recommended Architecture

```
                  EXTERNAL                          SERVER                              CLIENT
              +----------------+          +---------------------------+          +------------------+
              |  FleetYards    |          |  Next.js 15 App Router    |          |  React UI        |
              |  API           |          |                           |          |                  |
              |  /v1/models    |  ------> |  Sync Service             |          |                  |
              |  (no auth)     |  (cron)  |  src/lib/ship-sync.ts     |          |                  |
              +----------------+          |         |                 |          |                  |
                                          |         v                 |          |                  |
                                          |  Ship Storage             |          |                  |
                                          |  src/lib/ship-storage.ts  |          |                  |
                                          |         |                 |          |                  |
                                          |         v                 |          |                  |
              +----------------+          |  MongoDB "ships"          |          |                  |
              |  MongoDB /     | <------> |  collection               |          |                  |
              |  Cosmos DB     |          |         |                 |          |                  |
              +----------------+          |         v                 |          |                  |
                                          |  API Routes               |  ------> |  Ship Picker     |
                                          |  /api/ships/*             |  (fetch) |  Fleet Builder   |
                                          |  /api/cron/ship-sync      |          |  Mission Planner |
                                          +---------------------------+          +------------------+
```

### Component Boundaries

| Component | Responsibility | Location | Communicates With |
|-----------|---------------|----------|-------------------|
| **Sync Service** | Fetches all ships from FleetYards API, transforms data, upserts into MongoDB | `src/lib/ship-sync.ts` | FleetYards API (outbound HTTP), Ship Storage (writes) |
| **Ship Storage** | CRUD operations for the `ships` collection, following existing `*-storage.ts` pattern | `src/lib/ship-storage.ts` | MongoDB (reads/writes), Sync Service (receives writes), API Routes (serves reads) |
| **Cron Route** | HTTP endpoint that triggers sync, protected by `CRON_SECRET` bearer token | `src/app/api/cron/ship-sync/route.ts` | Sync Service (invokes), external scheduler (triggered by) |
| **Ship API Routes** | Serve ship data to frontend with filtering, search, pagination | `src/app/api/ships/route.ts`, `src/app/api/ships/[id]/route.ts` | Ship Storage (reads), Frontend components (serves) |
| **Ship Types** | TypeScript interfaces for stored ship documents and API responses | `src/types/ShipData.ts` (extended) | All other components (imported) |
| **Migration Script** | One-time script to convert name-based references to FleetYards UUIDs | `src/scripts/migrate-ship-refs.ts` | MongoDB directly (reads/writes all affected collections) |
| **Image Resolution** | Resolves ship image URLs from FleetYards CDN data stored in ship document | `src/lib/ships/image.ts` (updated) | Ship documents (reads imageUrl fields), UI components (serves URLs) |
| **Mongo Indexes** | Index definitions for the new `ships` collection | `src/lib/mongo-indexes.ts` (extended) | MongoDB (creates indexes) |
| **Frontend Components** | Ship pickers, fleet builder, mission planner consume ship API | `src/components/UserFleetBuilder.tsx`, mission planner components | Ship API Routes (fetches), Ship Types (uses interfaces) |

---

## Data Flow

### 1. Sync Flow (Server-side, periodic)

```
FleetYards API (/v1/models?page=N&perPage=200)
       |
       | HTTP GET (paginated, ~3-5 pages for ~500 ships)
       v
  Sync Service (src/lib/ship-sync.ts)
       |
       | Transform: FleetYards JSON -> ShipDocument shape
       | - Extract: id, name, slug, manufacturer, classification, focus
       | - Extract: metrics (beam, cargo, length, height, mass, size, crew)
       | - Extract: speeds (scmSpeed)
       | - Extract: media URLs (storeImage, angledView, sideView, etc.)
       | - Extract: productionStatus, onSale, pledgePrice
       | - Normalize: size string to enum ("small" -> "Small")
       | - Normalize: focus string to role array ("Starter / Touring" -> ["Starter","Touring"])
       | - Set: syncedAt = now, syncVersion = incrementing counter
       |
       v
  Ship Storage (src/lib/ship-storage.ts)
       |
       | bulkWrite with upsert (match on fleetyardsId)
       | - Existing docs: $set all fields, bump syncVersion
       | - New docs: insert with all fields
       | - Stale docs: NOT deleted (marked stale via missing syncVersion)
       |
       v
  MongoDB "ships" collection
       |
       | Sync metadata written to "sync-status" collection
       | - lastSyncAt, shipCount, duration, errors, syncVersion
       v
  Done. Next sync in 24 hours.
```

### 2. Read Flow (Client request)

```
  Browser (React component)
       |
       | fetch('/api/ships?manufacturer=Aegis&size=Medium&search=Vanguard')
       v
  API Route (src/app/api/ships/route.ts)
       |
       | Build MongoDB query from query params
       | Apply pagination (page, limit, default 50)
       v
  Ship Storage (src/lib/ship-storage.ts)
       |
       | db.collection('ships').find(query).sort().skip().limit()
       v
  MongoDB "ships" collection
       |
       | Return documents
       v
  API Route
       |
       | Transform to ShipResponse (strip internal fields)
       | Add pagination metadata (total, page, pages, hasMore)
       v
  Browser
       |
       | Render ship cards with FleetYards CDN image URLs
       v
  UI Display
```

### 3. Ship Reference Flow (How ships are stored in other entities)

```
  BEFORE MIGRATION (current):
  ┌─────────────────────────────────────┐
  │ User.ships[]: UserShip              │
  │   { manufacturer: "Aegis Dynamics", │
  │     name: "Vanguard Sentinel",      │
  │     image: "https://images..." }    │
  └─────────────────────────────────────┘

  AFTER MIGRATION (target):
  ┌──────────────────────────────────────────┐
  │ User.ships[]: UserShip                   │
  │   { fleetyardsId: "uuid-here",          │
  │     name: "Vanguard Sentinel",           │  <-- denormalized for display
  │     manufacturer: "Aegis Dynamics" }     │  <-- denormalized for display
  └──────────────────────────────────────────┘

  Image URL resolved at read time from ships collection, NOT stored in reference.
```

### 4. Migration Flow (One-time)

```
  Migration Script (src/scripts/migrate-ship-refs.ts)
       |
       | 1. Load ALL ships from MongoDB ships collection
       | 2. Build lookup map: shipName (lowercased) -> fleetyardsId
       | 3. For EACH collection with ship references:
       |
       |--- users collection:
       |    For each user.ships[] entry:
       |      Match name -> fleetyardsId via lookup map
       |      Rewrite { manufacturer, name, image } -> { fleetyardsId, name, manufacturer }
       |      Log unmatched ships as warnings
       |
       |--- planned-missions collection:
       |    For each mission.ships[] (MissionShip) entry:
       |      Match shipName -> fleetyardsId via lookup map
       |      Add fleetyardsId field, keep shipName for display
       |
       |--- missions collection:
       |    For each mission.participants[].shipName:
       |      Match shipName -> fleetyardsId via lookup map
       |      Add fleetyardsId field, keep shipName for display
       |
       |--- operations collection:
       |    For each operation.participants[].shipName:
       |      Match shipName -> fleetyardsId via lookup map
       |      Add fleetyardsId field
       |
       | 4. Write migration report (matched, unmatched, errors)
       v
  Done. All references now contain fleetyardsId.
```

---

## Database Schema Design

### Ships Collection (`ships`)

```typescript
interface ShipDocument {
  // Identity
  _id: ObjectId;                    // MongoDB auto-generated
  fleetyardsId: string;            // FleetYards UUID (indexed, unique) -- THE canonical ID
  slug: string;                     // URL-safe identifier (indexed, unique)
  name: string;                     // Display name (indexed for text search)
  scIdentifier: string;             // In-game identifier (e.g., "orig_100i")

  // Classification
  manufacturer: {
    name: string;                   // "Origin Jumpworks"
    code: string;                   // "ORIG"
    slug: string;                   // "origin-jumpworks"
  };
  classification: string;          // "multi", "combat", "transport", etc.
  focus: string;                   // Raw focus string "Starter / Touring"
  roles: string[];                 // Parsed roles ["Starter", "Touring"]
  size: 'Snub' | 'Small' | 'Medium' | 'Large' | 'Capital';
  productionStatus: string;        // "flight-ready", "in-concept", etc.

  // Metrics
  crew: { min: number; max: number };
  cargo: number;                   // SCU
  length: number;                  // meters
  beam: number;                    // meters
  height: number;                  // meters
  mass: number;                    // kg
  scmSpeed: number | null;         // m/s
  hydrogenFuelTankSize: number | null;
  quantumFuelTankSize: number | null;

  // Pricing (informational)
  pledgePrice: number | null;      // USD
  price: number | null;            // aUEC

  // Images (FleetYards CDN URLs)
  images: {
    store: string | null;          // Primary display image
    storeLarge: string | null;     // High-res store image
    angledView: string | null;     // Angled perspective
    angledViewMedium: string | null;
    sideView: string | null;       // Side profile
    sideViewMedium: string | null;
    topView: string | null;        // Top-down view
    topViewMedium: string | null;
    frontView: string | null;      // Front view
    fleetchartImage: string | null; // Fleet chart silhouette
  };

  // Sync Metadata
  syncedAt: Date;                  // When this record was last synced
  syncVersion: number;             // Incrementing sync batch number
  fleetyardsUpdatedAt: string;     // FleetYards' own updatedAt timestamp

  // Application Metadata
  createdAt: Date;                 // First time synced into our DB
  updatedAt: Date;                 // Last modified in our DB
}
```

### Indexing Strategy

```typescript
// In src/lib/mongo-indexes.ts -- additions to ensureMongoIndexes()
const ships = db.collection('ships');
await Promise.all([
  // Primary lookup by FleetYards UUID (unique, most common join key)
  ships.createIndex({ fleetyardsId: 1 }, { unique: true }),

  // Slug lookup for URL-based routes (/ships/avenger-titan)
  ships.createIndex({ slug: 1 }, { unique: true }),

  // Name search (case-insensitive text search for ship picker)
  ships.createIndex({ name: 'text', 'manufacturer.name': 'text' }),

  // Filter queries (manufacturer + size combo is the most common filter)
  ships.createIndex({ 'manufacturer.name': 1, size: 1, name: 1 }),

  // Production status filter (show only flight-ready ships)
  ships.createIndex({ productionStatus: 1, 'manufacturer.name': 1 }),

  // Sync housekeeping (find stale records from previous sync)
  ships.createIndex({ syncVersion: 1 }),

  // Size-based queries (mission planner filters by size)
  ships.createIndex({ size: 1, name: 1 }),
]);
```

### Sync Status Collection (`sync-status`)

```typescript
interface SyncStatusDocument {
  _id: ObjectId;
  type: 'ship-sync';              // Allows other sync types later
  lastSyncAt: Date;
  lastSyncVersion: number;
  shipCount: number;               // Total ships after sync
  newShips: number;                // Ships added this sync
  updatedShips: number;            // Ships modified this sync
  durationMs: number;              // How long sync took
  status: 'success' | 'partial' | 'failed';
  errors: string[];                // Any errors encountered
  apiPagesProcessed: number;       // How many API pages fetched
}
```

### UserShip Type (Updated)

```typescript
// In src/types/user.ts
export interface UserShip {
  fleetyardsId: string;           // FleetYards UUID -- canonical reference
  name: string;                    // Denormalized for display without JOIN
  manufacturer: string;            // Denormalized for display without JOIN
  // image field REMOVED -- resolved at render time from ships collection
}
```

### MissionShip Type (Updated)

```typescript
// In src/types/PlannedMission.ts
export interface MissionShip {
  fleetyardsId: string;           // FleetYards UUID -- canonical reference
  shipName: string;                // Denormalized display name
  manufacturer: string;            // Denormalized manufacturer
  size: string;                    // Denormalized size
  role?: string[];                 // Denormalized roles
  // image field REMOVED -- resolved at render time
  quantity: number;
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
}
```

---

## API Route Design

### Ship Data Endpoints

#### `GET /api/ships`
Serve paginated, filterable ship list from MongoDB.

```
Query Parameters:
  ?page=1              (default: 1)
  ?limit=50            (default: 50, max: 200)
  ?manufacturer=Aegis   (filter by manufacturer name, partial match)
  ?size=Medium          (filter by size category)
  ?status=flight-ready  (filter by production status)
  ?search=vanguard      (text search across name + manufacturer)
  ?roles=combat         (filter by role, comma-separated)
  ?sort=name            (sort field: name, manufacturer, size, pledgePrice)
  ?order=asc            (sort order: asc, desc)

Response:
{
  ships: ShipResponse[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number,
    hasMore: boolean
  }
}
```

#### `GET /api/ships/[id]`
Single ship by FleetYards UUID or slug.

```
Response: ShipResponse (full detail including all image URLs)
```

#### `GET /api/ships/batch`
Batch resolve multiple ships by IDs (for rendering mission ship rosters).

```
Query Parameters:
  ?ids=uuid1,uuid2,uuid3    (comma-separated FleetYards UUIDs)

Response:
{
  ships: ShipResponse[]     (ordered same as input IDs)
}
```

#### `GET /api/ships/manufacturers`
List all manufacturers with ship counts.

```
Response:
{
  manufacturers: { name: string, code: string, count: number }[]
}
```

### Sync Endpoint

#### `GET /api/cron/ship-sync`
Trigger ship sync (protected by CRON_SECRET bearer token).

```
Headers:
  Authorization: Bearer <CRON_SECRET>

Response:
{
  success: boolean,
  result: {
    shipCount: number,
    newShips: number,
    updatedShips: number,
    durationMs: number,
    errors: string[]
  }
}
```

This follows the exact pattern of the existing `GET /api/cron/discord-sync` route.

---

## Sync Service Architecture

### Location & Structure

```
src/lib/
  ship-sync.ts           // Core sync logic (fetch, transform, upsert)
  ship-storage.ts        // MongoDB CRUD for ships collection
  ship-types.ts          // (optional) FleetYards raw response types

src/app/api/
  cron/
    ship-sync/
      route.ts           // Cron endpoint (mirrors discord-sync pattern)
  ships/
    route.ts             // GET ship list with filters
    [id]/
      route.ts           // GET single ship by UUID or slug
    batch/
      route.ts           // GET multiple ships by IDs
    manufacturers/
      route.ts           // GET manufacturer list
```

### Sync Service Internal Design (`ship-sync.ts`)

```typescript
// Pseudocode structure:

export async function syncShipsFromFleetYards(): Promise<SyncResult> {
  const syncVersion = Date.now();
  let page = 1;
  let allShips: ShipDocument[] = [];
  let hasMore = true;

  // Phase 1: Fetch all pages from FleetYards
  while (hasMore) {
    const response = await fetchFleetYardsPage(page, PER_PAGE);
    const transformed = response.map(transformFleetYardsShip);
    allShips.push(...transformed);
    hasMore = response.length === PER_PAGE;
    page++;
    // Respect rate limits: small delay between pages
    await sleep(200);
  }

  // Phase 2: Bulk upsert into MongoDB
  const bulkOps = allShips.map(ship => ({
    updateOne: {
      filter: { fleetyardsId: ship.fleetyardsId },
      update: { $set: { ...ship, syncVersion, syncedAt: new Date(), updatedAt: new Date() } },
      upsert: true
    }
  }));

  const result = await shipCollection.bulkWrite(bulkOps, { ordered: false });

  // Phase 3: Record sync status
  await saveSyncStatus({ ... });

  return {
    shipCount: allShips.length,
    newShips: result.upsertedCount,
    updatedShips: result.modifiedCount,
    ...
  };
}
```

### Key Design Decisions for Sync Service

1. **Fetch all, then upsert** (not stream): FleetYards has ~500 ships. Fetching all into memory (~2MB) is trivial. Bulk upsert is more efficient than individual operations.

2. **Upsert on fleetyardsId, never delete**: Ships that disappear from the API are NOT deleted from our database. They simply won't get their `syncVersion` updated. A separate cleanup query can identify stale ships if needed. This prevents breaking references.

3. **Transform at sync time, not read time**: The FleetYards response has deeply nested objects and many fields we don't need. We flatten and normalize during sync so that read-time queries are fast and simple.

4. **No JSON fallback for ships collection**: Unlike user-storage.ts which falls back to JSON files, the ships collection is read-only cached data from an external API. If MongoDB is down, the ship data simply isn't available. The UI should handle this gracefully (show loading/error states). Rationale: shipping a 500-ship JSON fallback adds complexity and goes stale immediately.

5. **syncVersion for staleness detection**: Each sync batch writes the same `syncVersion` to all ships it touches. After sync, any ship with `syncVersion < currentSyncVersion` was NOT in the latest FleetYards response. This allows querying for "disappeared" ships without deleting them.

---

## Image URL Resolution

### Current Pattern (Being Replaced)

```
Ship name -> formatShipImageName() -> cdn() -> https://images.aydocorp.space/avenger_titan.png
```

This relies on:
- Self-hosted images on R2 CDN
- Name-to-filename convention (lowercase, underscores, strip special chars)
- Single image per ship

### New Pattern

```
Ship document in MongoDB contains all FleetYards CDN URLs:
  images.store      -> Primary display image
  images.angledView -> Card/thumbnail image
  images.sideView   -> Detail/profile image
  images.topView    -> Fleet chart view
```

### Image Resolution Helper (Updated `src/lib/ships/image.ts`)

```typescript
// New approach:
export function resolveShipImage(
  ship: ShipResponse | null,
  view: 'store' | 'angled' | 'side' | 'top' = 'store'
): string {
  if (!ship?.images) return getShipPlaceholder();

  const urlMap = {
    store: ship.images.store || ship.images.storeLarge,
    angled: ship.images.angledViewMedium || ship.images.angledView,
    side: ship.images.sideViewMedium || ship.images.sideView,
    top: ship.images.topViewMedium || ship.images.topView,
  };

  return urlMap[view] || ship.images.store || getShipPlaceholder();
}
```

### Next.js Image Configuration

The `next.config.js` `remotePatterns` must be updated to allow FleetYards CDN domains:

```javascript
images: {
  remotePatterns: [
    // Existing
    { protocol: 'https', hostname: 'images.aydocorp.space', pathname: '/**' },
    // New: FleetYards CDN
    { protocol: 'https', hostname: 'fleetyards.net', pathname: '/uploads/**' },
    { protocol: 'https', hostname: '*.fleetyards.net', pathname: '/**' },
  ],
}
```

### Transition Notes

- The `cdn()` helper in `src/lib/cdn.ts` is NOT used for FleetYards images. FleetYards images are absolute URLs stored directly in the ship document. The `cdn()` helper remains for other app assets.
- The `formatShipImageName()`, `getShipImagePath()`, and `getDirectImagePath()` functions in `src/types/ShipData.ts` become deprecated after migration.
- Components switch from `getShipImagePath(ship.name)` to `resolveShipImage(ship, 'angled')`.

---

## Migration Patterns

### Strategy: Big-Bang Migration

The project requires a single migration script that runs AFTER the first successful FleetYards sync populates the `ships` collection, but BEFORE any code is deployed that expects `fleetyardsId` on ship references.

### Migration Script Design (`src/scripts/migrate-ship-refs.ts`)

```
Phase 1: Build Lookup Map
  - Load all ships from "ships" collection
  - Build Map<string, string>:  lowercased ship name -> fleetyardsId
  - Also build alternate name map for known mismatches

Phase 2: Migrate Users
  - Load all users from "users" collection
  - For each user.ships[] entry:
    - Look up fleetyardsId by name (case-insensitive)
    - Rewrite entry: add fleetyardsId, remove image field
    - If no match: log warning, keep entry with fleetyardsId = null

Phase 3: Migrate Planned Missions
  - Load all planned missions from "planned-missions" collection
  - For each mission.ships[] entry:
    - Look up fleetyardsId by shipName
    - Add fleetyardsId field
  - For each mission.participants[] if present:
    - Look up fleetyardsId by shipName if present

Phase 4: Migrate Missions (legacy)
  - Load all missions from "missions" collection
  - For each mission.participants[].shipName:
    - Look up fleetyardsId
    - Add fleetyardsId to participant object

Phase 5: Migrate Operations
  - Load all operations from operations collection
  - For each operation.participants[].shipName:
    - Look up fleetyardsId
    - Add fleetyardsId to participant object

Phase 6: Migrate Resources
  - Load resources with type "Ship" or "Vehicle"
  - Match name/model to fleetyardsId
  - Add fleetyardsId field

Phase 7: Report
  - Print total entities processed
  - Print match rate per collection
  - List all unmatched ship names (for manual review)
  - Write report to data/migration-report.json
```

### Name Matching Strategy

Ship names between the current database and FleetYards API may not match exactly. The migration must handle:

| Current Name | FleetYards Name | Strategy |
|-------------|----------------|----------|
| `Vanguard Sentinel` | `Vanguard Sentinel` | Exact match |
| `F7C Hornet Mk I` | `F7C Hornet` | Fuzzy match (contains) |
| `San'tok.yai` | `San'tok.yai` | Special character normalization |
| `600i Explorer` | `600i Explorer` | Exact match |
| `Caterpillar Best In Show Edition` | `Caterpillar Best In Show Edition` | Exact match or variant lookup |

Matching priority:
1. Exact name match (case-insensitive)
2. FleetYards `rsiName` match (the RSI marketing name)
3. Slug-based match (normalize both names to slugs and compare)
4. Contains match (one name contains the other -- use cautiously)
5. Manual override map for known mismatches

### Rollback Strategy

The migration script should:
1. Run in `--dry-run` mode first (report what WOULD change without writing)
2. Write a rollback file with original values before modifying each document
3. Be idempotent (safe to run multiple times)

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Live API Calls on Every Page Load
**What:** Calling FleetYards API directly from API routes or components when a user requests ship data.
**Why bad:** FleetYards has no SLA. Adds 200-500ms latency per request. Rate limiting could break the UI.
**Instead:** Sync to MongoDB periodically. Serve from local database. Always.

### Anti-Pattern 2: Storing Full Image URLs in Ship References
**What:** Saving `image: "https://fleetyards.net/uploads/..."` in UserShip or MissionShip objects.
**Why bad:** FleetYards may change CDN URLs. You'd need to migrate every reference. Data duplication.
**Instead:** Store only `fleetyardsId`. Resolve image URL at render time from the ships collection.

### Anti-Pattern 3: Dual-Format Transition Period
**What:** Supporting BOTH name-based references AND fleetyardsId-based references simultaneously.
**Why bad:** Every query needs to handle both formats. Every component needs conditional logic. Bugs multiply.
**Instead:** Big-bang migration. One cutover. Code only needs to understand one format.

### Anti-Pattern 4: Deleting Ships That Disappear from API
**What:** Removing ships from MongoDB if they don't appear in the latest FleetYards sync.
**Why bad:** Ships temporarily removed from FleetYards (e.g., during rework) would break all references in user fleets and missions.
**Instead:** Use `syncVersion` to mark stale ships but never delete. UI can filter to `productionStatus: 'flight-ready'` for active lists.

### Anti-Pattern 5: Syncing in API Route Request Path
**What:** Checking "is data stale?" on every API request and triggering sync inline.
**Why bad:** First request after sync window triggers slow sync. Race conditions if multiple requests arrive.
**Instead:** Dedicated cron endpoint. Sync runs on schedule, completely independent of read path.

---

## Patterns to Follow

### Pattern 1: Storage Module per Entity (Existing)
**What:** Each entity type has `src/lib/{entity}-storage.ts` with standard CRUD interface.
**When:** Always for new data entities.
**Example:** `ship-storage.ts` follows same structure as `user-storage.ts`, `planned-mission-storage.ts`.

### Pattern 2: Cron Route with Bearer Auth (Existing)
**What:** Cron endpoints at `/api/cron/{job}/route.ts` protected by `CRON_SECRET` env var.
**When:** Any scheduled background job.
**Example:** New `ship-sync` route mirrors existing `discord-sync` route exactly.

### Pattern 3: Denormalize for Display, Reference by ID
**What:** Ship references store `fleetyardsId` (canonical) plus `name` and `manufacturer` (denormalized for display without JOIN).
**When:** Any embedded reference to a ship in another document.
**Why:** MongoDB doesn't support JOINs efficiently. Denormalized fields prevent N+1 queries for lists. The `fleetyardsId` is the source of truth if denormalized fields go stale.

### Pattern 4: Bulk Image Resolution
**What:** When displaying a list of ships (mission roster, user fleet), batch-fetch ship documents by IDs and resolve images in one query.
**When:** Any UI that shows multiple ships.
**Example:** `/api/ships/batch?ids=uuid1,uuid2` avoids N individual queries.

### Pattern 5: Index-First Schema Design
**What:** Design indexes before writing queries. Every query pattern must have a supporting index.
**When:** Any new collection.
**Example:** Ships collection has 7 indexes covering all planned query patterns (UUID lookup, slug lookup, text search, manufacturer+size filter, status filter, sync housekeeping, size filter).

---

## Suggested Build Order

Dependencies between components dictate the build order. Each phase depends on the previous one being complete.

### Phase 1: Foundation (No existing code changes)
**Build:**
1. `ShipDocument` TypeScript interface and `ShipResponse` API type
2. `ship-storage.ts` -- MongoDB CRUD for ships collection
3. Index definitions in `mongo-indexes.ts`
4. `ship-sync.ts` -- Sync service (fetch + transform + upsert)
5. `/api/cron/ship-sync/route.ts` -- Cron endpoint

**Why first:** This is isolated infrastructure. No existing code is modified. Can be tested independently by running sync and verifying MongoDB data.

**Dependency:** None. Purely additive.

### Phase 2: Ship API Routes (No existing code changes)
**Build:**
1. `/api/ships/route.ts` -- List with filters/search/pagination
2. `/api/ships/[id]/route.ts` -- Single ship by UUID or slug
3. `/api/ships/batch/route.ts` -- Batch resolve by IDs
4. `/api/ships/manufacturers/route.ts` -- Manufacturer list

**Why second:** API routes depend on ship-storage.ts from Phase 1. Still no modifications to existing code. Can be tested with API client.

**Dependency:** Phase 1 (ship-storage, ships collection must exist).

### Phase 3: Migration Script (Modifies data, not code)
**Build:**
1. `src/scripts/migrate-ship-refs.ts` -- Full migration script
2. Name matching logic with fuzzy matching
3. Dry-run mode and rollback file generation
4. Migration report output

**Why third:** Migration requires Phase 1 (ships collection populated) to build the lookup map. Must run BEFORE Phase 4 deploys code that expects `fleetyardsId`.

**Dependency:** Phase 1 (ships collection must be populated via sync).

### Phase 4: Type Updates and Image Resolution (Modifies existing code)
**Build:**
1. Update `UserShip` type -- add `fleetyardsId`, remove `image`
2. Update `MissionShip` type -- add `fleetyardsId`
3. Update `MissionParticipant` type -- add `fleetyardsId`
4. Update `OperationParticipant` type -- add `fleetyardsId`
5. Update `src/lib/ships/image.ts` -- new `resolveShipImage()` taking ship document
6. Update `next.config.js` -- add FleetYards CDN to `remotePatterns`
7. Update API validation schemas (profile route Zod schema for UserShip)

**Why fourth:** Type changes are the pivot point. After this, all code expects the new shape. Migration (Phase 3) must have already converted the data.

**Dependency:** Phase 3 (data must be migrated before code expects new shape).

### Phase 5: Frontend Component Updates (Modifies existing UI)
**Build:**
1. Update `UserFleetBuilder.tsx` -- use `/api/ships` instead of static `getShipsByManufacturer()`
2. Update mission planner ship picker -- use `/api/ships` with search
3. Update `MissionDetail.tsx` -- resolve images from ship documents
4. Update `OperationDetailView.tsx` -- resolve images from ship documents
5. Update `UserProfileContent.tsx` -- display ships with FleetYards images
6. Remove deprecated `loadShipDatabase()` and `shipManufacturers` usage

**Why fifth:** Frontend depends on both API routes (Phase 2) and correct types (Phase 4).

**Dependency:** Phase 2 (API routes), Phase 4 (updated types).

### Phase 6: Cleanup and Decommission
**Build:**
1. Remove `public/data/ships.json`
2. Remove or deprecate `src/lib/ship-data.ts` (the old loader)
3. Remove `shipManufacturers` array from `src/types/ShipData.ts`
4. Remove `formatShipImageName()`, `getShipImagePath()`, `getDirectImagePath()` functions
5. Update CLAUDE.md documentation

**Why last:** Only after all consumers have been migrated can the old code be safely removed.

**Dependency:** Phase 5 (all consumers migrated).

### Build Order Summary

```
Phase 1: Foundation         [New code only, no changes]
    |
    v
Phase 2: Ship API Routes   [New code only, no changes]
    |
    v
Phase 3: Migration Script  [Modifies DATA in MongoDB, not code]
    |
    v
Phase 4: Type Updates       [Modifies existing types and helpers]
    |
    v
Phase 5: Frontend Updates   [Modifies existing components]
    |
    v
Phase 6: Cleanup           [Removes old code and data]
```

---

## Scalability Considerations

| Concern | Current (~20 users) | At 100 Users | At 1000 Users |
|---------|--------------------:|-------------:|--------------:|
| Ships collection size | ~500 docs (~1MB) | Same | Same |
| Sync frequency | Daily | Daily | Daily |
| Ship API requests/sec | <1 | ~5 | ~50 |
| Index memory | <5MB | <5MB | <5MB |
| Batch resolve payload | 5-10 ships | 5-10 ships | 5-10 ships |

Ship data is essentially static reference data. The collection size is bounded by the number of ships in Star Citizen (~500), not by user count. No scalability concerns for the foreseeable future.

---

## Sources

- **Codebase analysis:** Direct inspection of all relevant source files (HIGH confidence)
- **FleetYards API:** Live inspection of `https://api.fleetyards.net/v1/models` response (HIGH confidence)
- **FleetYards pagination:** Inferred from API behavior (page/perPage params, response size) (MEDIUM confidence -- no official docs found, but behavior is consistent)
- **MongoDB indexing:** Based on MongoDB 6.x documentation and existing `mongo-indexes.ts` patterns (HIGH confidence)
- **Existing architecture:** Based on `.planning/codebase/ARCHITECTURE.md` and direct source inspection (HIGH confidence)

---

*Architecture analysis: 2026-02-03*
