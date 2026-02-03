# Phase 2: Ship API Routes - Research

**Researched:** 2026-02-03
**Domain:** Next.js App Router REST API design, MongoDB query patterns, Azure Cosmos DB vCore text search, pagination
**Confidence:** HIGH

## Summary

Phase 2 exposes the Phase 1 ship data through four REST endpoints: a paginated/filtered ship list, single ship lookup by UUID or slug, batch resolution by UUID array, and a manufacturers list. The core challenge is implementing text search and multi-field filtering on Azure Cosmos DB for MongoDB vCore in a way that is performant and compatible.

The critical finding of this research: **the project uses Cosmos DB for MongoDB vCore** (confirmed by `mongocluster.cosmos.azure.com` in the connection string), which **does support `$text` indexes and the `$text` operator**. This resolves the blocker flagged in Phase 1 research. A compound text index on `name` and `manufacturer.name` is the recommended search strategy, with `$text` queries for search and standard MongoDB filter queries for manufacturer, size, role, and production status.

The API routes follow the codebase's established patterns exactly: Next.js App Router route handlers using `NextRequest`/`NextResponse`, Zod for query parameter validation, `{ _id: 0 }` projection to strip MongoDB internals, and the existing offset-based pagination pattern used by `/api/users` and `/api/fleet-ops/missions`. Ship endpoints should be **public (no auth required)** since they serve cached reference data, not user-specific content.

**Primary recommendation:** Build four route files following existing codebase patterns, extend `ship-storage.ts` with query functions that push filtering to MongoDB (using existing indexes plus a new text index), and keep the response shape consistent with the `{ items, page, pageSize, total, totalPages }` envelope already used elsewhere.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 15.3.3 (installed) | App Router route handlers | Project framework, all API routes use this |
| `mongodb` | 6.21.0 (installed) | Database queries with `$text`, `$in`, filter, sort, skip, limit | Already used throughout, singleton connection via `mongodb-client.ts` |
| `zod` | 3.25.76 (installed) | Query parameter validation and coercion | Already used in operations, signup, contact routes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next-auth` | 4.24.11 (installed) | Session check (optional) | Only if auth-gating specific endpoints |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MongoDB `$text` search | Application-level regex/filter | `$text` is index-backed and handles stemming/stop words; regex causes collection scans on non-anchored patterns. vCore supports `$text`, so use it |
| MongoDB `$text` search | `$regex` with `^` prefix | Only works for prefix matching, not substring/fuzzy. Poor UX for "find me the Super Hornet" |
| Offset-based pagination | Cursor-based pagination | Cursor-based is better for real-time feeds; offset is simpler, matches existing codebase pattern, and ship data is static reference data where consistency is fine |
| No auth on ship endpoints | Session-based auth like other routes | Ship data is public reference data (same data FleetYards serves publicly). Auth adds latency for no security benefit |

**Installation:**
```bash
# No new dependencies needed. Everything is already installed.
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    api/
      ships/
        route.ts              # GET /api/ships -- paginated, filtered ship list (API-01)
        [id]/
          route.ts            # GET /api/ships/[id] -- single ship by UUID or slug (API-02)
        batch/
          route.ts            # GET /api/ships/batch -- batch resolve by UUID array (API-03)
        manufacturers/
          route.ts            # GET /api/ships/manufacturers -- manufacturer list (API-04)
  lib/
    ship-storage.ts           # EXTEND -- add query functions (findShips, findShipsByIds, getManufacturers)
  lib/
    mongo-indexes.ts          # EXTEND -- add text index on name + manufacturer.name
```

### Pattern 1: Public API Route (No Auth)
**What:** Ship data endpoints do not require authentication.
**When to use:** Reference data that is not user-specific and is sourced from a public API (FleetYards).
**Why:** Ship data is the same for every user. Requiring auth adds a session lookup (~50ms) to every request with no security benefit. The codebase's other auth-free route is `/api/storage-status`.
**Example:**
```typescript
// Source: Adapted from existing codebase patterns
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // No session check -- ship data is public reference data
    const { searchParams } = new URL(request.url);
    // ... process request
    return NextResponse.json({ items, page, pageSize, total, totalPages });
  } catch (error: unknown) {
    console.error('[ships] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Pattern 2: Offset-Based Pagination Envelope (Existing Pattern)
**What:** All list endpoints return `{ items, page, pageSize, total, totalPages }`.
**When to use:** Every paginated list endpoint.
**Why:** The codebase already uses this exact shape in `/api/users` and `/api/fleet-ops/missions`. Consistency reduces frontend integration effort.
**Example from codebase:**
```typescript
// Source: src/app/api/users/route.ts (existing pattern)
const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
const pageSizeRaw = parseInt(searchParams.get('pageSize') || '50', 10);
const pageSize = Math.min(200, Math.max(1, pageSizeRaw));

// ... fetch data ...

const res = NextResponse.json({
  items: paged,
  page,
  pageSize,
  total: totalCount,
  totalPages: Math.ceil(totalCount / pageSize) || 1,
});
res.headers.set('Cache-Control', 'no-store');
return res;
```

**Difference for ships:** Push `skip`/`limit` to MongoDB instead of fetching all and slicing in JS. The existing users/missions routes fetch all then slice because their storage layer returns full lists. For ships (~500 docs), this is acceptable either way, but pushing to MongoDB is cleaner and scales better.

### Pattern 3: Zod Query Parameter Validation
**What:** Validate and coerce URL search params with Zod before use.
**When to use:** Any route that accepts query parameters.
**Why:** Zod's `z.coerce.number()` handles string-to-number conversion from URL params cleanly. `safeParse` returns typed data or field-level errors.
**Example:**
```typescript
// Source: Pattern from existing operations route + Zod best practices
const ShipListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  manufacturer: z.string().optional(),
  size: z.string().optional(),
  classification: z.string().optional(),
  productionStatus: z.string().optional(),
  search: z.string().optional(),
});
```

### Pattern 4: MongoDB `$text` Search with Filter Composition
**What:** Combine `$text` search with field-equality filters in a single MongoDB query.
**When to use:** When users can search by text AND filter by category simultaneously.
**Why:** MongoDB allows `$text` to be combined with other query predicates. The text index handles tokenization and stemming; field filters use standard indexes.
**Example:**
```typescript
// Source: MongoDB documentation + Cosmos DB vCore $text operator docs
const filter: Record<string, unknown> = {};

// Text search (requires text index on collection)
if (search) {
  filter.$text = { $search: search };
}

// Field filters (use existing indexes)
if (manufacturer) {
  filter['manufacturer.slug'] = manufacturer;
}
if (size) {
  filter.size = size;
}
if (classification) {
  filter.classification = classification;
}
if (productionStatus) {
  filter.productionStatus = productionStatus;
}

const ships = await collection
  .find(filter, { projection: { _id: 0 } })
  .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 })
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .toArray();

const total = await collection.countDocuments(filter);
```

### Pattern 5: Dynamic Route with UUID-or-Slug Detection
**What:** Accept either a UUID or a slug in the same `[id]` parameter.
**When to use:** When a resource has two unique identifiers (UUID for internal use, slug for URLs).
**Why:** Phase 1 created unique indexes on both `fleetyardsId` and `slug`. A UUID is detectable by format (contains hyphens and hex chars, 36 chars long).
**Example:**
```typescript
// Source: Derived from existing getShipByFleetyardsId/getShipBySlug in ship-storage.ts
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getShipByIdOrSlug(idOrSlug: string): Promise<ShipDocument | null> {
  if (UUID_REGEX.test(idOrSlug)) {
    return getShipByFleetyardsId(idOrSlug);
  }
  return getShipBySlug(idOrSlug);
}
```

### Anti-Patterns to Avoid
- **Fetching all ships then filtering in JS:** Push filters and pagination to MongoDB. Even with ~500 docs, in-memory filtering breaks if the collection grows and creates unnecessary memory pressure.
- **Using `$regex` for text search:** Unanchored `$regex` causes full collection scans on Cosmos DB. Use `$text` with a text index instead.
- **Adding auth to ship endpoints:** Ship data is public reference data from FleetYards. Auth adds latency with no security benefit.
- **Creating a new MongoDB client/connection:** Use the existing `connectToDatabase()` from `mongodb-client.ts`.
- **Inventing a new pagination shape:** Use the existing `{ items, page, pageSize, total, totalPages }` envelope.
- **Accepting batch UUIDs via query string:** Use POST with JSON body or GET with comma-separated query param. POST with body is cleaner for large arrays but GET is more RESTful for read operations. Use POST for batch since arrays in query strings are awkward.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text search | Custom regex matching or in-memory filtering | MongoDB `$text` index + operator | Cosmos DB vCore supports it; handles stemming, stop words, relevance scoring |
| Pagination math | Custom offset calculation | Existing `page`/`pageSize` pattern from `/api/users` | Already tested, consistent response shape |
| UUID detection | Manual string checks | Regex pattern `/^[0-9a-f]{8}-...-[0-9a-f]{12}$/i` | Standard UUID v4 format, deterministic |
| Query parameter validation | Manual parseInt/string checks | Zod schema with `z.coerce` | Type-safe, handles defaults, produces structured errors |
| Connection management | New MongoClient | Existing `connectToDatabase()` singleton | Connection pooling, HMR safety, retry logic built in |
| Manufacturer aggregation | Fetching all ships + JS reduce | MongoDB `distinct()` or aggregation pipeline | Single DB round-trip, handles deduplication |

**Key insight:** The entire stack for this phase is already installed and patterned. The work is writing query functions in `ship-storage.ts` and route handlers that compose them.

## Common Pitfalls

### Pitfall 1: Text Index Creation Fails Silently on Cosmos DB
**What goes wrong:** The text index is added to `mongo-indexes.ts` but fails silently because of the `.catch(() => {})` pattern. All `$text` queries then fail at runtime with "text index required" errors.
**Why it happens:** The existing index creation pattern swallows errors for resilience. This is fine for regular indexes but a text index failure is critical for search functionality.
**How to avoid:**
1. Log text index creation specifically: `ships.createIndex({ name: 'text', 'manufacturer.name': 'text' }).catch(err => console.warn('TEXT INDEX FAILED:', err))`
2. Add a startup health check that verifies the text index exists: `collection.indexes()` and check for `"key": { "_fts": "text" }`
3. Provide a fallback code path: if `$text` query throws, fall back to `$regex` with case-insensitive flag as degraded search
**Warning signs:** Search endpoint returns 500 errors or empty results when search text is provided.

### Pitfall 2: `$text` Query Combined with Sort Requires textScore
**What goes wrong:** Combining `$text` with `.sort({ name: 1 })` fails because MongoDB requires text search results to be sorted by `textScore` unless you explicitly override.
**Why it happens:** MongoDB's text search returns results with an implicit relevance score. Sorting by a non-text field requires the query to handle scoring differently.
**How to avoid:**
1. When `search` is provided, sort by `{ score: { $meta: 'textScore' } }` for relevance
2. When `search` is NOT provided, sort by `{ name: 1 }` (alphabetical)
3. Do NOT combine `$text` with `$meta: 'textScore'` sort AND another sort field simultaneously on Cosmos DB vCore (limitation)
**Warning signs:** "Cannot use textScore sort with other sort fields" errors.

### Pitfall 3: Batch Endpoint with Unbounded Array
**What goes wrong:** A client sends 10,000 UUIDs to the batch endpoint, causing a massive `$in` query that consumes excessive resources.
**Why it happens:** No validation on the input array size.
**How to avoid:**
1. Cap the batch array at a sensible maximum (50 UUIDs). Fleet displays and mission rosters never need more than ~20-30 ships
2. Validate with Zod: `z.array(z.string().uuid()).max(50)`
3. Return 400 with a clear error if the limit is exceeded
**Warning signs:** Slow batch responses, high RU consumption from single requests.

### Pitfall 4: `countDocuments` with `$text` Filter is Expensive
**What goes wrong:** Calling `countDocuments(filter)` with a `$text` predicate to get the total count requires a full text index scan, doubling the query cost.
**Why it happens:** MongoDB must run the text search twice: once for the paginated results, once for the count.
**How to avoid:**
1. Accept the cost -- for ~500 documents, this is fast enough (<10ms)
2. Alternatively, use `estimatedDocumentCount()` for the no-filter case (returns total ships without scanning)
3. For filtered + searched results, the double query is unavoidable without caching
**Warning signs:** Search queries taking >100ms when the collection is small.

### Pitfall 5: Manufacturer Logos Not in Ship Documents
**What goes wrong:** API-04 requires manufacturer logos but the `ShipDocument.manufacturer` only stores `{ name, code, slug }` -- no logo URL.
**Why it happens:** The Phase 1 FleetYards API response includes manufacturer data but the transformer may not extract logo URLs.
**How to avoid:**
1. Check the FleetYards API response for manufacturer logo fields
2. The manufacturer logo can be derived from the manufacturer slug using FleetYards CDN URL pattern, OR extracted from the FleetYards `/v1/manufacturers` endpoint
3. For the manufacturer list endpoint, aggregate distinct manufacturers from the ships collection and construct logo URLs from the slug/code
4. Alternative: if FleetYards provides a dedicated manufacturers endpoint, call it during sync and store manufacturer data separately
**Warning signs:** Manufacturer list returns without logo URLs, breaking the UI.

### Pitfall 6: Pre-existing Build Failure Blocks Verification
**What goes wrong:** Phase 2 routes are implemented correctly but `npm run build` fails due to the pre-existing discord.js/zlib-sync webpack issue in planned-missions route.
**Why it happens:** This is a known concern from Phase 1 (noted in STATE.md). The build failure is unrelated to ship API routes but prevents build verification.
**How to avoid:**
1. Test routes via `npm run dev` (development server) which does not trigger the webpack bundling issue
2. Run `npm run type-check` separately to verify TypeScript correctness
3. Note the build issue as a known limitation in verification
**Warning signs:** `npm run build` fails with zlib-sync errors unrelated to ship code.

## Code Examples

### Ship List Query Function (ship-storage.ts extension)
```typescript
// Source: Derived from existing ship-storage.ts patterns + MongoDB $text docs

interface ShipQueryOptions {
  page: number;
  pageSize: number;
  manufacturer?: string;     // manufacturer slug
  size?: string;             // "small", "medium", "large", "capital"
  classification?: string;   // "combat", "transport", "multi", etc.
  productionStatus?: string; // "flight-ready", "in-concept", etc.
  search?: string;           // free text search
}

interface ShipQueryResult {
  items: ShipDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function findShips(options: ShipQueryOptions): Promise<ShipQueryResult> {
  const { page, pageSize, manufacturer, size, classification, productionStatus, search } = options;
  const shipsCollection = await getShipsCollection();

  // Build filter
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$text = { $search: search };
  }
  if (manufacturer) {
    filter['manufacturer.slug'] = manufacturer;
  }
  if (size) {
    filter.size = size;
  }
  if (classification) {
    filter.classification = classification;
  }
  if (productionStatus) {
    filter.productionStatus = productionStatus;
  }

  // Determine sort
  const sort = search
    ? { score: { $meta: 'textScore' as const } }
    : { name: 1 as const };

  // Build projection
  const projection = search
    ? { _id: 0, score: { $meta: 'textScore' as const } }
    : { _id: 0 };

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    shipsCollection
      .find(filter, { projection })
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    shipsCollection.countDocuments(filter),
  ]);

  return {
    items: items as ShipDocument[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}
```

### Batch Resolve Function (ship-storage.ts extension)
```typescript
// Source: Derived from existing ship-storage.ts + MongoDB $in docs

export async function getShipsByFleetyardsIds(
  ids: string[]
): Promise<ShipDocument[]> {
  if (ids.length === 0) return [];

  const shipsCollection = await getShipsCollection();
  const docs = await shipsCollection
    .find(
      { fleetyardsId: { $in: ids } },
      { projection: { _id: 0 } }
    )
    .toArray();

  return docs as ShipDocument[];
}
```

### Manufacturers Aggregation Function (ship-storage.ts extension)
```typescript
// Source: MongoDB aggregation docs

interface ManufacturerInfo {
  name: string;
  code: string;
  slug: string;
  shipCount: number;
}

export async function getManufacturers(): Promise<ManufacturerInfo[]> {
  const shipsCollection = await getShipsCollection();
  const result = await shipsCollection
    .aggregate([
      {
        $group: {
          _id: '$manufacturer.slug',
          name: { $first: '$manufacturer.name' },
          code: { $first: '$manufacturer.code' },
          slug: { $first: '$manufacturer.slug' },
          shipCount: { $sum: 1 },
        },
      },
      { $sort: { name: 1 } },
      { $project: { _id: 0, name: 1, code: 1, slug: 1, shipCount: 1 } },
    ])
    .toArray();

  return result as ManufacturerInfo[];
}
```

### Zod Query Schema for Ship List
```typescript
// Source: Zod coerce pattern + existing codebase patterns

import { z } from 'zod';

export const ShipListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  manufacturer: z.string().optional(),
  size: z.string().optional(),
  classification: z.string().optional(),
  productionStatus: z.string().optional(),
  search: z.string().min(1).optional(),
});

export const BatchQuerySchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
});
```

### Route Handler: GET /api/ships (complete)
```typescript
// Source: Existing route patterns from operations + users routes

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as shipStorage from '@/lib/ship-storage';

const ShipListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  manufacturer: z.string().optional(),
  size: z.string().optional(),
  classification: z.string().optional(),
  productionStatus: z.string().optional(),
  search: z.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query params into plain object for Zod
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const parseResult = ShipListQuerySchema.safeParse(rawParams);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    const result = await shipStorage.findShips(parseResult.data);

    const res = NextResponse.json(result);
    // Cache for 5 minutes -- ship data changes only during sync (every 6 hours)
    res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    return res;
  } catch (error: unknown) {
    console.error('[ships] Error fetching ships:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch ships' },
      { status: 500 }
    );
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fetch all ships to client, filter in JS | MongoDB-level filtering with `$text` + field filters + `skip`/`limit` | This phase | Server-side filtering, pagination, reduced payload |
| `no-store` cache on all API responses | `public, max-age=300` for ship list | This phase | 5-min cache for reference data reduces DB queries |
| Auth required on all API routes | Public endpoints for reference data | This phase | Faster response, simpler client integration |
| In-memory search (loadShipDatabase) | Database-backed `$text` search | This phase | Proper text search with stemming, relevance scoring |

**Deprecated/outdated:**
- Phase 1 research flagged "text indexes may not be supported" -- this was for RU-based Cosmos DB. Project uses **vCore**, which supports `$text`. Resolved.
- The PITFALLS.md recommendation for "application-level filtering" was based on the RU-tier assumption. With vCore, database-level `$text` is the correct approach.

## Text Search Strategy Decision

**RESOLVED: Use MongoDB `$text` index on Cosmos DB vCore.**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| MongoDB `$text` index | Index-backed, handles stemming/stop words, relevance scoring, supported on vCore | One text index per collection, requires index setup | **USE THIS** |
| `$regex` (case-insensitive) | Simple, no index needed | Full collection scan, no stemming, no relevance scoring, expensive RU on Cosmos DB | Reject |
| Application-level filter | No DB dependency | Requires fetching all 500+ docs per request, memory pressure, no stemming | Reject (fallback only) |
| Azure AI Search | Best search quality | Requires separate Azure service, added cost, deployment complexity, overkill for ~500 docs | Reject |

**Text index configuration:**
```javascript
// Create on ships collection
db.ships.createIndex(
  { name: "text", "manufacturer.name": "text" },
  { weights: { name: 10, "manufacturer.name": 5 } }
)
```

This allows searching for ship names ("Constellation", "Hornet") and manufacturer names ("Origin", "Aegis") with name matches weighted higher.

## Caching Strategy

Ship data is reference data that changes only during sync (every 6 hours). Apply aggressive caching:

| Endpoint | Cache-Control | Rationale |
|----------|---------------|-----------|
| `GET /api/ships` | `public, max-age=300, stale-while-revalidate=60` | 5-min cache, serve stale while revalidating |
| `GET /api/ships/[id]` | `public, max-age=300, stale-while-revalidate=60` | Same -- individual ship data |
| `POST /api/ships/batch` | `no-store` | POST requests should not be cached |
| `GET /api/ships/manufacturers` | `public, max-age=3600` | Manufacturers change even less frequently than ships |

This is a departure from the existing `no-store` pattern used by other routes, but ship data is fundamentally different from user-specific data.

## Manufacturer Logos

The `ShipDocument.manufacturer` stores `{ name, code, slug }` but no logo URL. Research into FleetYards API:

**Finding:** FleetYards ships API response does not include manufacturer logo URLs directly in the ship model. However, FleetYards has a dedicated manufacturers endpoint: `GET /v1/manufacturers` which likely includes logo data.

**Recommendation:**
1. The manufacturers endpoint can derive logo URLs from the FleetYards CDN using the manufacturer slug: `https://cdn.fleetyards.net/uploads/manufacturer/logo/{slug}/...`
2. Alternatively, during Phase 1 sync, manufacturer logo URLs could be fetched separately from the FleetYards `/v1/manufacturers` endpoint and stored
3. For Phase 2 MVP: return manufacturers from `$group` aggregation on ships collection (name, code, slug, shipCount). Logo URLs can be a URL construction from slug, or deferred to Phase 4 (image resolution)

**Confidence:** MEDIUM -- the exact FleetYards manufacturer logo URL pattern needs verification at implementation time.

## Open Questions

1. **Manufacturer logo URLs from FleetYards**
   - What we know: FleetYards has a `/v1/manufacturers` endpoint. The ships API does not include logo URLs in the ship model directly.
   - What's unclear: The exact URL pattern for manufacturer logos on the FleetYards CDN.
   - Recommendation: For Phase 2, return manufacturer data without logos. Add logos in Phase 4 when image resolution is implemented, or verify the CDN pattern during Phase 2 implementation.

2. **Text index weights optimization**
   - What we know: Cosmos DB vCore supports weighted text indexes. Name should be weighted higher than manufacturer name.
   - What's unclear: Whether Cosmos DB vCore's weight implementation matches native MongoDB behavior exactly.
   - Recommendation: Start with `{ name: 10, "manufacturer.name": 5 }`. Test with common ship search queries. Adjust if relevance ranking is poor.

3. **Search fallback behavior**
   - What we know: If text index creation fails, all `$text` queries will error.
   - What's unclear: How often Cosmos DB vCore text index creation fails in practice.
   - Recommendation: Implement a runtime fallback that catches `$text` query errors and degrades to `$regex` search on `name` field with case-insensitive flag. Log the fallback so it's visible.

## Sources

### Primary (HIGH confidence)
- **Azure Cosmos DB vCore text index documentation:** [learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/how-to-create-text-index](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/how-to-create-text-index) -- confirms text index support, syntax, limitations
- **Azure Cosmos DB vCore `$text` operator documentation:** [learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/commands/query-and-write/text](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/commands/query-and-write/text) -- confirms `$search`, `$caseSensitive`, `$meta: "textScore"` support
- **Connection string analysis:** `.env.example` shows `mongocluster.cosmos.azure.com` which definitively identifies **vCore tier** (not RU-based)
- **Existing codebase patterns:** `src/app/api/users/route.ts`, `src/app/api/fleet-ops/missions/route.ts`, `src/app/api/fleet-ops/operations/route.ts` -- pagination envelope, filter parsing, error handling, auth patterns
- **Phase 1 ship-storage.ts:** Existing functions (getShipByFleetyardsId, getShipBySlug, getShipCount) provide the base for extension
- **Phase 1 mongo-indexes.ts:** Existing indexes on `fleetyardsId` (unique), `slug` (unique), `manufacturer.code`, `productionStatus`, `manufacturer.code + size` compound

### Secondary (MEDIUM confidence)
- **Azure Cosmos DB tier identification:** [learn.microsoft.com/en-us/azure/cosmos-db/mongodb/choose-model](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/choose-model) -- confirms `mongocluster.cosmos.azure.com` is vCore
- **MongoDB `$in` operator performance:** [MongoDB Community Forums](https://www.mongodb.com/community/forums/t/query-performance-using-in-operator-maching-more-than-600-values/232358) -- array size up to BSON limit (16MB), N*log(M) complexity with index
- **RU-based vs vCore text search support:** [WebSearch verified with Microsoft docs](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/vcore/indexing) -- RU-based does NOT support text indexes, vCore DOES

### Tertiary (LOW confidence)
- Manufacturer logo URL pattern on FleetYards CDN -- inferred from other CDN URLs seen in ship data, not directly verified
- Text index weight behavior on Cosmos DB vCore vs native MongoDB -- documented as supported but not tested

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns verified in codebase
- Architecture: HIGH -- follows existing route patterns exactly, route structure is deterministic
- Text search strategy: HIGH -- Cosmos DB vCore confirmed, `$text` support verified via official Microsoft docs
- Pitfalls: HIGH -- common MongoDB/Cosmos DB issues documented from official sources and Phase 1 research
- Manufacturer logos: MEDIUM -- FleetYards CDN pattern needs verification during implementation

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days -- stable technology, no version changes expected)
