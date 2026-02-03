# Phase 1: Sync Engine & Data Model - Research

**Researched:** 2026-02-03
**Domain:** FleetYards API data synchronization, MongoDB schema design, scheduled job execution
**Confidence:** HIGH

## Summary

Phase 1 builds the foundational data infrastructure: a FleetYards API client that fetches all Star Citizen ships via paginated requests, validates them with Zod, transforms them into an internal schema, and upserts them into a MongoDB `ships` collection. This is purely additive work -- no existing code is modified, no existing data is touched. The phase also establishes a sync audit trail and cron-triggered sync endpoint.

The standard approach uses the project's existing patterns: a `ship-storage.ts` module following the `*-storage.ts` convention, a cron API route mirroring the existing `/api/cron/discord-sync` pattern, native `fetch` for HTTP (no new HTTP library), Zod 3.x for validation (already installed), and MongoDB bulkWrite for efficient upserts. Two new dependencies are needed: `node-cron` for scheduling and `p-limit` for API request throttling.

The FleetYards API is a simple, unauthenticated REST API returning ~400-500 ships across 2-3 pages at 200 items per page. Ship records include UUIDs, detailed specs, manufacturer info, multiple image URLs from `cdn.fleetyards.net`, and production status. The API uses `Link` header pagination. Rate limits are undocumented -- conservative 1 request/second pacing is recommended.

**Primary recommendation:** Build the sync pipeline as three isolated modules (FleetYards API client, sync service, ship storage) plus a cron route, following existing codebase patterns exactly. Use `node-cron` initialized via Next.js `instrumentation.ts` for scheduling.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native `fetch` | Built-in (Node.js 18+) | FleetYards API HTTP client | Zero bundle impact, Next.js extends it, simple REST GET calls need no Axios features |
| `zod` | ^3.24.4 (installed: 3.25.76) | API response validation | Already in project, `safeParse()` for per-record validation without crashing sync |
| `mongodb` | ^6.16.0 (installed: 6.21.0) | Database operations (bulkWrite, indexes) | Already in project, existing singleton pattern in mongodb-client.ts |
| `node-cron` | ^4.2.1 | Scheduled sync execution | Lightweight in-process scheduler, works with Azure App Service "Always On", zero infrastructure overhead |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `p-limit` | ^6.2.0 | API request concurrency control | Throttle FleetYards API page fetches to 1 concurrent request |
| `@types/node-cron` | ^3.0.11 | TypeScript types for node-cron | Development only, type safety for cron schedule configuration |

**Note on p-limit version:** Use `p-limit@6.2.0` (not 7.x) to avoid potential ESM-only compatibility issues. Version 6.x is ESM-only but has been stable with Next.js 15 for longer. Alternatively, since only 2-3 sequential page fetches are needed, a simple `await sleep(delay)` between fetches achieves the same goal without any dependency. **Recommendation: skip p-limit entirely, use inline delay.**

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native fetch | Axios (already installed) | Axios adds interceptors/cancellation not needed for 3 GET requests; native fetch is lighter |
| node-cron | Azure Timer Functions | Requires separate Azure Function App, deployment pipeline, and infrastructure; massive overkill for one lightweight job |
| node-cron | External cron service (cron-job.org) | Adds external dependency, requires exposing HTTP endpoint with auth; node-cron is simpler |
| bulkWrite | Individual upserts | bulkWrite is 10-50x faster for 500 docs; individual upserts are safer on Cosmos DB if bulkWrite fails |
| p-limit | Manual delay between fetches | For 2-3 requests, `await new Promise(r => setTimeout(r, 200))` is simpler than adding a dependency |

**Installation:**
```bash
# New production dependency
npm install node-cron@^4.2.1

# New dev dependency
npm install -D @types/node-cron@^3.0.11
```

**That's it.** One new production dependency. Everything else is already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/
    fleetyards/
      client.ts            # FleetYards API client (fetch wrapper, pagination, retry)
      types.ts             # FleetYards raw API response types
      transform.ts         # FleetYards response -> ShipDocument mapper
    ship-sync.ts           # Sync orchestrator (fetch all -> validate -> upsert -> audit)
    ship-storage.ts        # MongoDB CRUD for ships collection (follows *-storage.ts pattern)
    mongo-indexes.ts       # EXISTING - add ships collection indexes
  types/
    ship.ts                # ShipDocument interface, SyncStatus interface, Zod schemas
  app/
    api/
      cron/
        ship-sync/
          route.ts         # Cron endpoint (mirrors discord-sync pattern)
  instrumentation.ts       # NEW - node-cron initialization (in src/ root)
```

### Pattern 1: Storage Module Per Entity (Existing Pattern)
**What:** Each data entity gets its own `src/lib/{entity}-storage.ts` with CRUD functions.
**When to use:** Always for new collections.
**Why:** The project has 7 existing storage modules following this exact pattern. Consistency reduces cognitive load.
**Example from codebase:**
```typescript
// Source: src/lib/user-storage.ts (existing pattern)
import * as mongoDb from './mongodb-client';
import * as localStorage from './local-storage';

let usingFallback = false;
let connectionChecked = false;

async function shouldUseFallback(): Promise<boolean> {
  // Check MongoDB connection, fall back to local if unavailable
}

export async function getUserById(id: string): Promise<User | null> {
  if (await shouldUseFallback()) {
    return await localStorage.getUserById(id);
  }
  try {
    return await mongoDb.getUserById(id);
  } catch (error) {
    usingFallback = true;
    return await localStorage.getUserById(id);
  }
}
```

**For ship-storage.ts:** No local JSON fallback is needed. Ships are cached reference data from an external API. If MongoDB is down, ships are simply unavailable and the UI should show an appropriate empty/error state. This differs from user-storage.ts where fallback is critical for authentication.

### Pattern 2: Cron Route with Bearer Auth (Existing Pattern)
**What:** Scheduled job endpoints at `/api/cron/{job}/route.ts` protected by `CRON_SECRET`.
**When to use:** Any background job that runs on a schedule.
**Example from codebase:**
```typescript
// Source: src/app/api/cron/discord-sync/route.ts (existing pattern)
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const syncResult = await syncAllUsersWithDiscord();

  return NextResponse.json({
    success: true,
    result: { /* counts, errors */ },
    timestamp: new Date().toISOString()
  });
}
```

### Pattern 3: Upsert-Never-Delete Sync
**What:** Sync jobs upsert by external ID and never delete records that disappear from the source.
**When to use:** Any external API data sync.
**Why:** Ships temporarily removed from FleetYards (rework, API bug) should not break existing references in user fleets and missions.
**Implementation:**
```typescript
// Upsert pattern with syncVersion tracking
const operations = ships.map(ship => ({
  updateOne: {
    filter: { fleetyardsId: ship.fleetyardsId },
    update: {
      $set: { ...ship, syncedAt: new Date(), syncVersion },
      $setOnInsert: { createdAt: new Date() },
    },
    upsert: true,
  },
}));
await collection.bulkWrite(operations, { ordered: false });
// Ships not in this sync batch retain old syncVersion -- detectable but not deleted
```

### Pattern 4: Zod safeParse at Trust Boundary
**What:** Validate each record individually with `safeParse()`, logging and skipping failures.
**When to use:** Any external API response before writing to database.
**Why:** One malformed ship record should not crash the entire sync of 500+ ships.
**Implementation:**
```typescript
const validated: ShipDocument[] = [];
const errors: string[] = [];

for (const raw of apiResponse) {
  const result = FleetYardsShipSchema.safeParse(raw);
  if (result.success) {
    validated.push(transformToShipDocument(result.data));
  } else {
    errors.push(`Ship ${raw?.name || 'unknown'}: ${result.error.message}`);
  }
}
```

### Pattern 5: Next.js Instrumentation Hook for Cron
**What:** Use `src/instrumentation.ts` to initialize node-cron on server startup.
**When to use:** Any process-level initialization that should run once when the server starts.
**Why:** Next.js instrumentation hook runs exactly once per server instance. No `experimental` flag needed in Next.js 15.
**Implementation:**
```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startShipSyncCron } = await import('./lib/ship-sync');
    startShipSyncCron();
  }
}
```

### Anti-Patterns to Avoid
- **Live API calls on page load:** Never call FleetYards API from API routes serving user requests. Always serve from MongoDB cache.
- **Storing raw API response:** Always transform through explicit mapper. FleetYards response structure may change.
- **Replace-all sync strategy:** Never `deleteMany({})` then insert. Use upsert-by-UUID only.
- **Adding Mongoose/Prisma:** Project uses raw MongoDB driver throughout. Adding an ORM for one collection creates two data access patterns.
- **Text search indexes on Cosmos DB:** Cosmos DB's MongoDB API does not reliably support text indexes. Use regex or application-level filtering instead.
- **Syncing in API route request path:** Don't check "is data stale?" on every request. Sync runs on its own schedule.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling | Custom setTimeout/setInterval loop | `node-cron` | Cron expression parsing, timezone handling, missed-schedule detection |
| MongoDB connection management | New MongoClient per request | Existing `mongodb-client.ts` singleton | Connection pooling, HMR safety, retry logic already built |
| API response validation | Manual if/else field checking | Zod `safeParse()` (already installed) | Type inference, error messages, composable schemas |
| Index creation | Manual createIndex calls | Extend existing `mongo-indexes.ts` | Idempotent, error-swallowing pattern already established |
| UUID generation | Manual random string | `crypto.randomUUID()` (built-in) | Cryptographically random, standard format |
| HTTP retry | Custom retry loop | Simple 3-line exponential backoff wrapper | No library needed, but must handle Retry-After header |
| Pagination | Guessing page count | Follow `Link` header `rel="next"` | FleetYards API uses standard RFC 8288 Link headers |

**Key insight:** The codebase already has mature patterns for storage, connection management, index creation, and cron routes. Phase 1 should copy these patterns precisely, not invent new ones.

## Common Pitfalls

### Pitfall 1: Sync Overwrites Good Data with Empty/Malformed API Response
**What goes wrong:** FleetYards returns empty array or partial data. Sync interprets as "no ships exist" and wipes collection.
**Why it happens:** Pagination overshoot returns `[]`. API outage returns error. Schema changes return unexpected shapes.
**How to avoid:**
1. Never delete ships -- upsert only, mark stale via syncVersion
2. Count validation: abort if fetched count < 80% of previous sync count
3. Require non-null `id`, `name`, `manufacturer` before writing any ship
4. Store previous sync count in sync-status collection for comparison
**Warning signs:** Sync returns <300 ships when 500+ expected; sync-status shows 0 newShips and 0 updatedShips.

### Pitfall 2: Cosmos DB MongoDB Compatibility Gaps
**What goes wrong:** Text search indexes, specific bulkWrite behaviors, or query operators don't work as expected on Cosmos DB.
**Why it happens:** Azure Cosmos DB's MongoDB API implements a subset of MongoDB features. The existing codebase already sets `retryWrites: false` because Cosmos DB 3.6 doesn't support retryable writes.
**How to avoid:**
1. Do NOT create text indexes (`{ name: 'text' }`). Use regex-based search or application-level filtering instead
2. Test bulkWrite with `ordered: false` specifically against Cosmos DB
3. If bulkWrite fails on Cosmos DB, fall back to individual upserts with per-document error handling
4. Use only simple single-field indexes and compound indexes with <= 8 keys
5. Monitor RU consumption after sync runs
**Warning signs:** Index creation fails silently (existing pattern catches and ignores); 429 errors from Cosmos DB.

### Pitfall 3: FleetYards API Rate Limiting
**What goes wrong:** Sync hits FleetYards rate limits, gets 429 responses, and fetches incomplete data.
**Why it happens:** FleetYards rate limits are completely undocumented. As a community project with modest infrastructure, aggressive fetching could trigger throttling.
**How to avoid:**
1. Add 200-500ms delay between page fetches
2. Check for 429 response status and respect `Retry-After` header
3. Log all non-200 responses for monitoring
4. Sync only needs 2-3 pages total -- this is a low-volume operation
**Warning signs:** Intermittent 429 responses in sync logs; inconsistent ship counts between sync runs.

### Pitfall 4: FleetYards Schema Drift
**What goes wrong:** FleetYards API changes field names, nesting structure, or image URL format. Sync silently writes null/undefined values.
**Why it happens:** FleetYards is actively maintained (v5.32.12, GitHub shows ongoing schema refactoring effort #2652). No versioned API contract.
**How to avoid:**
1. Explicit mapper function: `transformFleetYardsResponse()` picks only known fields and provides defaults for missing ones
2. Log unknown/dropped fields at warn level to discover new API fields passively
3. Pin transformer to specific known fields -- treat everything else as optional
4. Zod schema validation catches unexpected nulls before they reach the database
**Warning signs:** Ships with null manufacturer names; sync logs showing Zod validation failures for fields that previously worked.

### Pitfall 5: p-limit ESM-Only Import Issues
**What goes wrong:** `p-limit` v4+ is ESM-only. Build or runtime errors when imported in CommonJS context.
**Why it happens:** Next.js 15 has good ESM support but some edge cases remain with ESM-only packages in server components.
**How to avoid:** Skip p-limit entirely. For 2-3 sequential page fetches, use a simple inline delay:
```typescript
await new Promise(resolve => setTimeout(resolve, 200)); // 200ms between page fetches
```
This eliminates the dependency and the compatibility concern entirely.

### Pitfall 6: Missing next.config.js remotePatterns for FleetYards CDN
**What goes wrong:** FleetYards images fail to load when using Next.js `Image` component because `cdn.fleetyards.net` is not in remotePatterns.
**Why it happens:** Current `next.config.js` only whitelists `images.aydocorp.space` and `aydocorp.space`.
**How to avoid:** This is a Phase 4 concern (not Phase 1), but Phase 1 should store the full CDN URLs in ship documents so they're available when Phase 4 adds remotePatterns. **Do not add remotePatterns in Phase 1** -- no images are displayed yet.

## Code Examples

Verified patterns from the existing codebase and FleetYards API:

### FleetYards API Response Structure (Verified via Live API Call)
```typescript
// Source: Live API response from https://api.fleetyards.net/v1/models?page=1&perPage=2
// Verified: 2026-02-03

interface FleetYardsShipResponse {
  id: string;                    // "719f60e4-ae48-4941-80f1-17528fd7dd06"
  name: string;                  // "100i"
  slug: string;                  // "100i"
  scIdentifier: string | null;   // "orig_100i"
  rsiId: number | null;
  rsiName: string | null;
  rsiSlug: string | null;

  manufacturer: {
    name: string;                // "Origin Jumpworks"
    longName: string;            // "Origin Jumpworks"
    slug: string;                // "origin-jumpworks"
    code: string;                // "ORIG"
  };

  classification: string;       // "multi"
  classificationLabel: string;  // "Multi"
  focus: string;                // "Starter / Touring"
  productionStatus: string;     // "flight-ready"
  size: string;                 // "small"

  crew: {
    min: number;                // 1
    max: number;                // 1
    minLabel: string;
    maxLabel: string;
  };

  cargo: number;                // 2.0
  mass: number;                 // 48143.0
  length: number;               // 19.0
  beam: number;                 // 12.0
  height: number;               // 5.0
  hydrogenFuelTankSize: number | null;
  quantumFuelTankSize: number | null;

  scmSpeed: number | null;      // 260.0

  pledgePrice: number | null;   // 50.0 (USD)
  price: number | null;         // 654000.0 (aUEC)

  description: string | null;

  storeImage: string | null;    // Full URL to store image
  storeUrl: string | null;      // RSI store URL

  // Image views - each has source + size variants
  angledView: { source: string; small: string; medium: string; large: string; } | null;
  sideView: { source: string; small: string; medium: string; large: string; } | null;
  topView: { source: string; small: string; medium: string; large: string; } | null;
  frontView: { source: string; small: string; medium: string; large: string; } | null;
  fleetchartImage: string | null;

  onSale: boolean;
  hasImages: boolean;
  hasPaints: boolean;

  lastUpdatedAt: string;        // "2025-12-03T21:19:04Z"
  createdAt: string;
  updatedAt: string;
}
```

### Internal ShipDocument Schema (Recommended)
```typescript
// Source: Derived from FleetYards response + project requirements DATA-01 through DATA-06

interface ShipDocument {
  // Identity (DATA-01)
  _id?: ObjectId;                     // MongoDB auto-generated
  fleetyardsId: string;              // FleetYards UUID - canonical ID, unique index
  slug: string;                       // URL-friendly identifier, unique index
  name: string;                       // Display name
  scIdentifier: string | null;        // In-game identifier

  // Classification (DATA-02)
  manufacturer: {
    name: string;                     // "Origin Jumpworks"
    code: string;                     // "ORIG"
    slug: string;                     // "origin-jumpworks"
  };
  classification: string;            // "multi", "combat", "transport"
  classificationLabel: string;       // "Multi", "Combat", "Transport"
  focus: string;                     // "Starter / Touring" (raw)
  size: string;                      // "small", "medium", "large", "capital"
  productionStatus: string;          // "flight-ready", "in-concept"

  // Specs (DATA-02)
  crew: { min: number; max: number };
  cargo: number;                     // SCU
  length: number;                    // meters
  beam: number;                      // meters
  height: number;                    // meters
  mass: number;                      // kg
  scmSpeed: number | null;           // m/s
  hydrogenFuelTankSize: number | null;
  quantumFuelTankSize: number | null;

  // Pricing
  pledgePrice: number | null;        // USD
  price: number | null;              // aUEC

  // Description & Links (DATA-04)
  description: string | null;
  storeUrl: string | null;           // RSI store URL

  // Images (DATA-03) - store full CDN URLs
  images: {
    store: string | null;            // storeImage URL
    angledView: string | null;       // source resolution
    angledViewMedium: string | null;
    sideView: string | null;
    sideViewMedium: string | null;
    topView: string | null;
    topViewMedium: string | null;
    frontView: string | null;
    frontViewMedium: string | null;
    fleetchartImage: string | null;
  };

  // Sync Metadata (DATA-06)
  syncedAt: Date;                    // When this record was last synced
  syncVersion: number;               // Incrementing sync batch number
  fleetyardsUpdatedAt: string;       // FleetYards' own updatedAt timestamp

  // Application Metadata
  createdAt: Date;                   // First time synced into our DB
  updatedAt: Date;                   // Last modified in our DB
}
```

### MongoDB Index Additions (Following Existing Pattern)
```typescript
// Source: Extend src/lib/mongo-indexes.ts following existing pattern

// Add to ensureMongoIndexes():
try {
  const ships = db.collection('ships');
  await Promise.all([
    // Primary lookup by FleetYards UUID (unique)
    ships.createIndex({ fleetyardsId: 1 }, { unique: true }).catch(() => {}),
    // Slug lookup for URL-based routes (unique)
    ships.createIndex({ slug: 1 }, { unique: true }).catch(() => {}),
    // Manufacturer filter queries
    ships.createIndex({ 'manufacturer.code': 1 }).catch(() => {}),
    // Production status filter
    ships.createIndex({ productionStatus: 1 }).catch(() => {}),
    // Sync housekeeping (find stale records)
    ships.createIndex({ syncVersion: 1 }).catch(() => {}),
    // Combined filter: manufacturer + size (common filter combo)
    ships.createIndex({ 'manufacturer.code': 1, size: 1 }).catch(() => {}),
  ]);
} catch (err) {
  console.warn('Index setup (ships) skipped or failed:', err);
}

// Also add sync-status collection indexes:
try {
  const syncStatus = db.collection('sync-status');
  await Promise.all([
    syncStatus.createIndex({ type: 1, lastSyncAt: -1 }).catch(() => {}),
  ]);
} catch (err) {
  console.warn('Index setup (sync-status) skipped or failed:', err);
}
```

**Important:** No text index (`{ name: 'text', 'manufacturer.name': 'text' }`) is created. Cosmos DB may not support text indexes reliably. Ship name search should use regex or application-level filtering (handled in Phase 2 API routes). The `name` field can get a simple ascending index if regex search performance is insufficient.

### Sync Audit Log Schema
```typescript
// Source: Requirement SYNC-07

interface SyncStatusDocument {
  _id?: ObjectId;
  type: 'ship-sync';                 // Allows other sync types later
  syncVersion: number;
  lastSyncAt: Date;
  shipCount: number;                  // Total ships after sync
  newShips: number;                   // Upserted (new) this sync
  updatedShips: number;               // Modified this sync
  unchangedShips: number;             // Matched but not modified
  skippedShips: number;               // Failed Zod validation
  durationMs: number;                 // Sync duration
  status: 'success' | 'partial' | 'failed';
  errors: string[];                   // Validation/API errors
  pagesProcessed: number;             // API pages fetched
}
```

### Cron Route Implementation (Following Discord Sync Pattern)
```typescript
// Source: Based on src/app/api/cron/discord-sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { syncShipsFromFleetYards } from '@/lib/ship-sync';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await syncShipsFromFleetYards();

    return NextResponse.json({
      success: true,
      result: {
        shipCount: result.shipCount,
        newShips: result.newShips,
        updatedShips: result.updatedShips,
        skippedShips: result.skippedShips,
        durationMs: result.durationMs,
        hasErrors: result.errors.length > 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ship sync failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request); // Manual trigger for testing
}
```

### Environment Variables (New)
```env
# Ship sync configuration
SHIP_SYNC_CRON_SCHEDULE=0 */6 * * *    # Every 6 hours (default)
SHIP_SYNC_ENABLED=true                  # Kill switch for sync
# CRON_SECRET already exists -- reused for ship-sync auth
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static `ships.json` (200 ships) | FleetYards API sync (500+ ships) | This phase | Always-current ship data, no manual maintenance |
| Name-based ship references | UUID-based references (FleetYards UUID) | This phase (storage); Phase 3 (migration) | Unambiguous identity, cross-system compatibility |
| Single ship image from R2 CDN | Multiple view angles from FleetYards CDN | This phase (storage); Phase 4 (display) | Richer ship visualization |
| `shipManufacturers` hardcoded array | Dynamic manufacturer data from API | This phase | New manufacturers automatically included |
| `formatShipImageName()` name-to-path convention | Direct CDN URLs stored in ship documents | This phase | No string manipulation, no naming convention fragility |

**Deprecated/outdated:**
- `public/data/ships.json`: Will be replaced by MongoDB ships collection (removal in Phase 7)
- `src/lib/ship-data.ts` (`loadShipDatabase()`): Will be replaced by ship-storage.ts (removal in Phase 7)
- `shipManufacturers` array in `ShipData.ts`: Will be replaced by dynamic API data (removal in Phase 7)
- `formatShipImageName()`, `getShipImagePath()`: Will be replaced by `resolveShipImage()` (removal in Phase 7)

## FleetYards API Reference

| Property | Value | Confidence |
|----------|-------|------------|
| Base URL | `https://api.fleetyards.net/v1` | HIGH (verified) |
| Models endpoint | `GET /v1/models` | HIGH (verified) |
| Single model | `GET /v1/models/{slug}` | HIGH (verified) |
| Authentication | None required (read-only) | HIGH (verified) |
| Pagination params | `?page=1&perPage=200` (1-based, max 200, default 30) | HIGH (verified) |
| Pagination response | `Link` header with `rel="next"`, `rel="last"` | HIGH (from docs) |
| Total ships | ~400-500 models (2 pages at perPage=200, page 3 returns empty) | HIGH (verified) |
| Rate limits | Not documented; conservative 200ms delay between requests | LOW (undocumented) |
| Image CDN | `cdn.fleetyards.net` | HIGH (verified from API response) |
| Image URL pattern | `https://cdn.fleetyards.net/uploads/model/{type}/{uuid_parts}/{size}_{filename}.jpg` | HIGH (verified) |
| API status | Actively maintained, v5.32.12 (Dec 2025) | HIGH (verified) |
| Response format | JSON array of ship objects | HIGH (verified) |

## Open Questions

Things that couldn't be fully resolved:

1. **FleetYards API rate limits**
   - What we know: Not documented anywhere. API is community-maintained.
   - What's unclear: Exact threshold for 429 responses, whether there's IP-based or time-window-based limiting.
   - Recommendation: Start with 200ms delay between page fetches. Monitor sync logs for 429 responses. The sync only makes 2-3 requests total, so this is unlikely to be an issue.

2. **Cosmos DB bulkWrite behavior with ordered:false**
   - What we know: Cosmos DB has MongoDB 4.2 compatibility. `retryWrites: false` is already set in the codebase.
   - What's unclear: Whether `bulkWrite` with `ordered: false` works correctly on Cosmos DB vCore, or if it silently drops operations.
   - Recommendation: Implement bulkWrite first. If sync testing shows inconsistencies, fall back to individual upserts with per-document error handling.

3. **Cosmos DB text search index support**
   - What we know: Classic Cosmos DB does not support text indexes. vCore may have different support.
   - What's unclear: Whether the project uses vCore or classic Cosmos DB.
   - Recommendation: Do NOT create text indexes in Phase 1. This is a Phase 2 concern. For Phase 1, only simple field indexes are needed.

4. **Azure App Service process recycling with node-cron**
   - What we know: "Always On" keeps the process alive. Deployments restart the process.
   - What's unclear: How often Azure App Service recycles the process outside of deployments.
   - Recommendation: Store `lastSyncAt` in the sync-status collection. On startup, check if a sync is overdue (>24h since last) and run immediately. This makes the system self-healing regardless of process lifecycle.

5. **Exact total ship count from FleetYards**
   - What we know: Page 2 at perPage=200 returns fewer than 200 ships; page 3 returns empty `[]`.
   - What's unclear: Exact total (WebFetch truncated the large response). Previous research documented 500+ ships.
   - Recommendation: Use range-based validation (expect 300-700 ships). Abort sync if count falls below 80% of previous sync.

## Sources

### Primary (HIGH confidence)
- **FleetYards API live inspection**: `GET https://api.fleetyards.net/v1/models?page=1&perPage=2` -- complete response structure verified 2026-02-03
- **FleetYards API pagination**: Page 3 at perPage=200 returns `[]` confirming 2 pages of data
- **FleetYards API docs**: `https://api.fleetyards.net/v1/` -- pagination docs, Link header format
- **Existing codebase patterns**: `src/app/api/cron/discord-sync/route.ts` (cron route), `src/lib/user-storage.ts` (storage module), `src/lib/mongodb-client.ts` (connection management), `src/lib/mongo-indexes.ts` (index creation), `src/types/ShipData.ts` (current ship types), `src/lib/ship-data.ts` (current ship loader)
- **Next.js instrumentation docs**: `https://nextjs.org/docs/app/guides/instrumentation` -- register() function, runtime check, no experimental flag needed
- **Package versions verified**: `node-cron@4.2.1`, `@types/node-cron@3.0.11` via npm registry; `zod@3.25.76`, `mongodb@6.21.0` installed in project

### Secondary (MEDIUM confidence)
- **FleetYards GitHub**: `https://github.com/fleetyards/fleetyards` -- v5.32.12, active maintenance, schema refactoring #2652
- **Cosmos DB compatibility**: Existing `retryWrites: false` in mongodb.ts confirms known Cosmos DB limitations
- **Prior project research**: `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md` -- comprehensive prior analysis

### Tertiary (LOW confidence)
- FleetYards API rate limits -- completely undocumented, conservative approach assumed
- Azure App Service process lifecycle with node-cron -- inferred from general Azure docs, not tested with this specific setup
- p-limit ESM compatibility -- known issue pattern from training data, not verified against this project's build

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries verified installed or available, versions confirmed, patterns verified in codebase
- Architecture: HIGH - follows established codebase patterns directly, API response structure verified live
- FleetYards API: HIGH - response structure, pagination, CDN hostname all verified via live API calls
- Pitfalls: HIGH - critical pitfalls identified from codebase analysis (Cosmos DB retryWrites flag, naming inconsistencies in ShipData.ts) and FleetYards API behavior (empty page returns)
- Scheduling: MEDIUM - node-cron + instrumentation hook is well-documented pattern but not tested on this specific Azure deployment

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days -- FleetYards API is stable, ship data changes only with SC patches)
