# Technology Stack: Dynamic Ship Database (FleetYards API Integration)

**Project:** AydoCorp Website - Dynamic Ship Database Milestone
**Researched:** 2026-02-03
**Overall Confidence:** MEDIUM-HIGH

---

## Existing Stack (Fixed Constraints)

These are already in the project and are NOT up for discussion. The new work must integrate with them.

| Technology | Installed Version | Latest Available | Purpose |
|---|---|---|---|
| Next.js | 15.3.3 | 16.1.6 | App framework (App Router) |
| TypeScript | ^5.8.3 | 5.8.x | Type safety |
| MongoDB Node.js Driver | 6.21.0 (installed) / ^6.16.0 (declared) | 7.0.0 | Database driver |
| Azure Cosmos DB (vCore/MongoDB API) | N/A | N/A | Primary database |
| Zod | 3.25.76 (installed) / ^3.24.4 (declared) | 4.3.6 | Schema validation |
| Axios | 1.13.2 (installed) / ^1.6.7 (declared) | 1.13.4 | HTTP client |
| Azure App Service | N/A | N/A | Deployment target |

**Key constraint:** This project deploys to **Azure App Service** (not Vercel). The GitHub Actions workflow (`main_aydocorp.yml`) builds a standalone Next.js app and deploys to Azure. This rules out Vercel-specific features like Vercel Cron Jobs.

---

## Recommended New Stack Additions

### 1. Scheduled Job Execution: `node-cron`

| | |
|---|---|
| **Package** | `node-cron` |
| **Version** | `^4.2.1` |
| **Types** | `@types/node-cron` `^3.0.11` |
| **Confidence** | **HIGH** |

**Why `node-cron`:**
- The app runs on Azure App Service as a **standalone Next.js server** with `output: 'standalone'` in production. This is a persistent, long-running Node.js process -- not serverless. `node-cron` attaches to the event loop and fires on schedule as long as the process is alive.
- Azure App Service with "Always On" enabled (required for Basic tier and above) keeps the process running 24/7. No cold starts, no process recycling under normal conditions.
- Zero infrastructure overhead. No separate Azure Function, no WebJob configuration, no external scheduler service. The cron runs inside the same process as Next.js.
- The sync payload is small (~500 ships, paginated at 200/page = 3 API calls) and completes in seconds. No need for durable execution, retry orchestration, or long-running job infrastructure.

**Why NOT alternatives:**

| Alternative | Why Not |
|---|---|
| **Vercel Cron Jobs** | Project deploys to Azure App Service, not Vercel. Not available. |
| **Azure WebJobs** | Requires separate deployment artifact, separate configuration (`settings.job` in `App_Data/jobs/`), and complicates CI/CD. Overkill for a single lightweight sync. |
| **Azure Functions (Timer Trigger)** | Requires a separate Azure Function App resource, separate deployment pipeline, separate codebase. Massive overhead for a simple periodic fetch. |
| **Inngest / Trigger.dev** | External SaaS dependencies with their own pricing, infrastructure, and vendor lock-in. Absurdly overengineered for syncing ~500 records every few hours. |
| **External cron services** (cron-job.org, EasyCron) | Requires exposing an unauthenticated HTTP endpoint or managing API keys. Adds external dependency for something the process can handle itself. |

**Implementation pattern:** Initialize `node-cron` in a Next.js [instrumentation hook](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation) (`instrumentation.ts`). This file runs once when the server starts, making it the ideal place to register cron schedules.

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startShipSyncCron } = await import('./lib/ship-sync/cron');
    startShipSyncCron();
  }
}
```

**Risk:** If Azure App Service recycles the process (deployments, scaling events, crashes), the cron state is lost. Mitigation: Store `lastSyncedAt` timestamp in MongoDB. On startup, check if a sync is overdue and run immediately. This makes the system self-healing.

---

### 2. FleetYards API Client: Native `fetch` with typed wrapper

| | |
|---|---|
| **Package** | None (use built-in `fetch`) |
| **Confidence** | **HIGH** |

**Why native `fetch` (not Axios, not Ky):**
- Axios is already in the project (`^1.6.7`), but for server-side-only code (the sync pipeline), native `fetch` is the better choice:
  - Zero additional bundle impact
  - Built into Node.js 18+ (project requires `>=18`)
  - Next.js extends `fetch` with caching semantics in server contexts
  - The FleetYards API is a simple REST API with no authentication -- just GET requests with pagination
- Axios's value (interceptors, request cancellation, browser compatibility) is irrelevant for a server-side sync script that makes 3 sequential GET requests.

**Why NOT alternatives:**

| Alternative | Why Not |
|---|---|
| **Axios** | Already in project but adds unnecessary overhead for simple server-side GET requests. Would work fine but is not the better tool for this job. |
| **Ky** | Good library (~3KB), but adding a new dependency for 3 fetch calls is unjustifiable. |
| **ofetch** | Same argument as Ky. |
| **got** | Server-only, heavy. No reason to add for this use case. |

**What to build:** A thin typed wrapper around `fetch` specific to the FleetYards API:

```typescript
// lib/fleetyards/client.ts
const FLEETYARDS_BASE = 'https://api.fleetyards.net/v1';
const PER_PAGE = 200; // FleetYards max

async function fetchPage<T>(path: string, page: number): Promise<{data: T[], hasMore: boolean}> {
  const res = await fetch(`${FLEETYARDS_BASE}${path}?page=${page}&perPage=${PER_PAGE}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store', // bypass Next.js fetch cache for sync operations
  });
  if (!res.ok) throw new FleetYardsApiError(res.status, path);
  const linkHeader = res.headers.get('Link');
  const hasMore = linkHeader?.includes('rel="next"') ?? false;
  return { data: await res.json(), hasMore };
}
```

**Retry logic:** Build a simple exponential backoff wrapper (3 retries, 1s/2s/4s delays). Respect `Retry-After` header if present. No library needed -- this is ~20 lines of code.

---

### 3. API Response Validation: Zod (existing)

| | |
|---|---|
| **Package** | `zod` (already installed) |
| **Version** | Keep `^3.24.4` (installed: 3.25.76) |
| **Confidence** | **HIGH** |

**Why keep Zod 3.x (not upgrade to Zod 4.x):**
- Zod 4.0 was released July 2025 with breaking changes and a new API surface. The project currently uses Zod 3.x (`3.25.76` installed).
- Upgrading to Zod 4.x is a **separate migration task** that touches every Zod schema in the app. Mixing Zod 3 and Zod 4 in the same codebase is possible (via `zod/v3` and `zod/v4` subpaths) but adds confusion.
- Zod 3.x is stable, maintained, and receives bug fixes. No urgency to upgrade for this milestone.
- The ship sync feature only needs basic Zod capabilities (object schemas, arrays, transforms) which work identically in v3.

**Pattern:** Define a `FleetYardsModelSchema` that validates and transforms the raw API response into the internal `Ship` type. Use `.safeParse()` at the trust boundary (immediately after `fetch`) so malformed records are logged and skipped rather than crashing the sync.

```typescript
const FleetYardsModelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  scIdentifier: z.string().nullable(),
  manufacturer: z.object({ name: z.string(), code: z.string() }),
  // ... more fields
}).transform(raw => toInternalShip(raw));
```

---

### 4. Database Sync: MongoDB `bulkWrite` with upserts

| | |
|---|---|
| **Package** | `mongodb` (already installed) |
| **Version** | Keep `^6.16.0` (installed: 6.21.0) |
| **Confidence** | **HIGH** |

**Why NOT upgrade to MongoDB driver 7.0:**
- Version 7.0.0 was released ~2 months ago and contains breaking changes.
- The project's `mongodb-client.ts` uses patterns (singleton `MongoClient`, `Collection` type exports) that may need refactoring for v7.
- Azure Cosmos DB (vCore) compatibility with the v7 driver is not yet widely documented.
- The v6 driver is fully sufficient and actively maintained.
- Upgrading the MongoDB driver is a separate infrastructure task, not part of ship database feature work.

**Sync strategy:** Use `collection.bulkWrite()` with `updateOne` + `upsert: true` operations, keyed on the FleetYards UUID (`id` field). This is the standard pattern for external API data sync:

```typescript
const operations = validatedShips.map(ship => ({
  updateOne: {
    filter: { fleetyardsId: ship.fleetyardsId },
    update: {
      $set: { ...ship, syncedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    upsert: true,
  },
}));
await shipsCollection.bulkWrite(operations, { ordered: false });
```

**Key design decisions:**
- **`ordered: false`**: Allows parallel execution on the server and continues on individual errors. If one ship fails, the others still sync.
- **`fleetyardsId` as the match key**: The FleetYards UUID is the canonical identifier. Create a unique index on this field.
- **`$setOnInsert` for `createdAt`**: Only set on first insert, never overwritten on updates.
- **Batch size**: ~500 ships is well within MongoDB's `maxWriteBatchSize` limit (100,000). Single `bulkWrite` call, no batching needed.
- **No deletion sync**: Do NOT auto-delete ships that disappear from FleetYards. Ships may be temporarily removed from the API. Instead, mark them as `lastSeenAt` and handle stale records separately.

---

### 5. Image CDN: FleetYards CDN (direct linking)

| | |
|---|---|
| **Package** | None (configuration only) |
| **Confidence** | **HIGH** |

**Verified CDN hostname:** `cdn.fleetyards.net` (confirmed via live API response)

**Image URL structure:** FleetYards provides multiple sizes per image:
- Original: `https://cdn.fleetyards.net/uploads/model/store_image/{uuid_parts}/{filename}.jpg`
- Small: `https://cdn.fleetyards.net/uploads/model/store_image/{uuid_parts}/small_{filename}.jpg`
- Medium: `https://cdn.fleetyards.net/uploads/model/store_image/{uuid_parts}/medium_{filename}.jpg`
- Large: `https://cdn.fleetyards.net/uploads/model/store_image/{uuid_parts}/large_{filename}.jpg`
- XLarge: `https://cdn.fleetyards.net/uploads/model/store_image/{uuid_parts}/xlarge_{filename}.jpg`

**Image types available per ship:**
- `storeImage` (marketing photo, multiple sizes)
- `fleetchartImage` (silhouette for fleet charts)
- `angledView`, `sideView`, `topView`, `frontView` (each with multiple sizes)

**Next.js configuration required** (add to `next.config.js` `images.remotePatterns`):

```javascript
{
  protocol: 'https',
  hostname: 'cdn.fleetyards.net',
  pathname: '/uploads/**',
}
```

**Why direct CDN linking (not mirroring to Cloudflare R2):**
- FleetYards CDN is fast, reliable, and free to consume. Images are already optimized at multiple sizes.
- Mirroring ~500 ships x ~6 image types x ~5 sizes = ~15,000 images to R2 adds massive complexity (download pipeline, storage costs, staleness management, broken link detection).
- Next.js `Image` component will handle format conversion (WebP/AVIF) and further optimization via its built-in optimizer when serving from remote patterns.
- If FleetYards CDN ever becomes unreliable, mirroring can be added later as a separate enhancement. Start simple.

**Risk:** FleetYards CDN availability. If `cdn.fleetyards.net` goes down, all ship images break. Mitigation: Store image URLs in MongoDB; display a placeholder/fallback image when the CDN is unavailable. Consider a future enhancement to lazy-mirror critical images to R2.

---

### 6. Rate Limiting & Concurrency: `p-limit`

| | |
|---|---|
| **Package** | `p-limit` |
| **Version** | `^7.3.0` |
| **Confidence** | **MEDIUM** |

**Why `p-limit`:**
- FleetYards API does not document rate limits explicitly, but as a community-maintained project, it likely has modest infrastructure. Being a responsible API consumer means limiting concurrent requests.
- `p-limit` provides a simple concurrency limiter. Set concurrency to 1 (sequential page fetches) or 2 at most.
- The total data volume is small (3 pages at 200 per page for ~500 ships), so concurrency is not about speed but about being polite.

**Why NOT alternatives:**

| Alternative | Why Not |
|---|---|
| **p-queue** | More features than needed (priority queues, events). `p-limit` is simpler. |
| **bottleneck** | Rate limiter with reservoir pattern. Overkill for 3 sequential requests. |
| **Custom implementation** | `p-limit` is 1.3KB. Not worth reimplementing. |

**Note:** `p-limit` is ESM-only since v4. The project uses Next.js 15 which supports ESM. Verify that the build pipeline handles ESM-only dependencies correctly.

---

## New Collection Schema

**Collection name:** `ships`

**Indexes to create:**
1. `{ fleetyardsId: 1 }` - unique index, primary lookup key
2. `{ slug: 1 }` - unique index, used for URL-friendly lookups
3. `{ "manufacturer.code": 1 }` - for filtering by manufacturer
4. `{ productionStatus: 1 }` - for filtering flight-ready vs in-concept
5. `{ name: "text", "manufacturer.name": "text" }` - text index for search

**Add to existing `mongo-indexes.ts`** following the project's established pattern.

---

## FleetYards API Reference

| Property | Value |
|---|---|
| **Base URL** | `https://api.fleetyards.net/v1` |
| **Short URL** | `https://api.fltyrd.net/v1` (alias) |
| **Models endpoint** | `/models` |
| **Single model** | `/models/{slug}` |
| **Authentication** | None required for read operations |
| **Pagination** | `?page=1&perPage=200` (1-based, max 200 per page, default 30) |
| **Pagination headers** | `Link` header with `rel="next"`, `rel="last"` |
| **Rate limits** | Not documented. Be conservative (1 req/sec). |
| **Image CDN** | `cdn.fleetyards.net` |
| **Project status** | Actively maintained, v5.32.12 (Dec 2025), 6,672 commits |
| **Total ships** | ~500+ models |

---

## Complete Installation Command

```bash
# New production dependencies
npm install node-cron@^4.2.1 p-limit@^7.3.0

# New dev dependencies
npm install -D @types/node-cron@^3.0.11
```

**That's it.** Two new production dependencies. Everything else (Zod, MongoDB driver, fetch) is already in the project.

---

## Environment Variables Required

```env
# Ship sync configuration
SHIP_SYNC_CRON_SCHEDULE=0 */6 * * *    # Every 6 hours (default suggestion)
SHIP_SYNC_ENABLED=true                  # Kill switch for sync
SHIP_SYNC_SECRET=<random-string>        # Auth token for manual sync trigger endpoint
```

---

## What NOT to Do

| Anti-Pattern | Why Avoid |
|---|---|
| **Upgrade to Next.js 16** | Major version jump unrelated to this feature. Separate task. |
| **Upgrade to MongoDB driver 7** | Breaking changes, unverified Cosmos DB compatibility. Separate task. |
| **Upgrade to Zod 4** | Breaking changes across all schemas. Separate task. |
| **Add Mongoose** | The project uses the raw MongoDB driver throughout. Adding Mongoose for one collection creates two data access patterns. |
| **Add Prisma** | Same argument as Mongoose. Does not support Cosmos DB well. |
| **Mirror images to R2** | Massive scope creep. Start with direct CDN linking. |
| **Use a message queue (Redis, RabbitMQ, SQS)** | The sync is a simple sequential process. No fan-out, no parallel workers, no retry queues needed. |
| **Build a custom admin UI for sync** | Start with a protected API route (`POST /api/admin/sync-ships`) that can be triggered manually via curl or a simple button. |
| **Use ISR/revalidation for ship data** | Ships change rarely (new ships added every few months). Database-backed API routes with reasonable cache headers are simpler and more predictable than ISR. |

---

## Confidence Assessment

| Area | Level | Reason |
|---|---|---|
| Scheduling (node-cron) | **HIGH** | Well-established pattern for Azure App Service with Always On. Verified that the project uses standalone output mode. |
| API Client (native fetch) | **HIGH** | FleetYards API verified live. Pagination, response structure, and CDN hostname confirmed via actual API calls. |
| Validation (Zod 3.x) | **HIGH** | Already in project, well-documented patterns. No version change needed. |
| Database Sync (bulkWrite) | **HIGH** | Standard MongoDB pattern. Verified bulkWrite is available in driver v6. Project already uses similar patterns for users. |
| Image CDN (direct linking) | **HIGH** | CDN hostname verified via live API response (`cdn.fleetyards.net`). Next.js remotePatterns configuration is straightforward. |
| Rate limiting (p-limit) | **MEDIUM** | FleetYards rate limits are undocumented. Conservative approach recommended. p-limit is well-maintained but ESM-only may need verification in the build pipeline. |

---

## Sources

### Verified via Live API Calls (HIGH confidence)
- FleetYards API v1 Models endpoint: `https://api.fleetyards.net/v1/models`
- FleetYards API single model: `https://api.fleetyards.net/v1/models/aurora-mr`
- Image CDN hostname confirmed: `cdn.fleetyards.net`
- Pagination: `?page=1&perPage=200` with `Link` header confirmed

### Verified via npm Registry (HIGH confidence)
- `node-cron` latest: 4.2.1 (verified `npm show node-cron version`)
- `@types/node-cron` latest: 3.0.11 (verified `npm show @types/node-cron version`)
- `zod` latest: 4.3.6, installed: 3.25.76 (verified `npm ls zod`)
- `mongodb` latest: 7.0.0, installed: 6.21.0 (verified `npm ls mongodb`)
- `p-limit` latest: 7.3.0 (verified `npm show p-limit version`)

### Verified via Project Codebase (HIGH confidence)
- Deployment target: Azure App Service (`.github/workflows/main_aydocorp.yml`)
- Standalone output mode: `scripts/next.config.js` line 5
- Existing MongoDB patterns: `src/lib/mongodb-client.ts`, `src/lib/mongodb.ts`
- Existing ships data: `public/data/ships.json` (static, ~500 ships)
- Existing Zod usage: `package.json` dependency `^3.24.4`

### WebSearch + Official Documentation (MEDIUM confidence)
- Vercel Cron Jobs docs: https://vercel.com/docs/cron-jobs (confirmed NOT applicable -- project is on Azure)
- MongoDB bulkWrite docs: https://www.mongodb.com/docs/drivers/node/current/crud/bulk-write/
- FleetYards GitHub: https://github.com/fleetyards/fleetyards (v5.32.12, Dec 2025, actively maintained)
- FleetYards docs: https://docs.fleetyards.net/
- Zod 4 release: https://www.infoq.com/news/2025/08/zod-v4-available/
- Next.js image remotePatterns: https://nextjs.org/docs/app/api-reference/components/image

### Training Data Only (LOW confidence)
- Azure App Service "Always On" behavior with Next.js standalone mode. Needs validation during implementation.
- FleetYards API rate limits (not documented anywhere found). Conservative approach assumed.
