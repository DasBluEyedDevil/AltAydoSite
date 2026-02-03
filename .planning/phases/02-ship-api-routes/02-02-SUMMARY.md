---
phase: 02-ship-api-routes
plan: 02
status: complete
subsystem: api
tags: [nextjs, api-routes, zod, pagination, caching]
dependency-graph:
  requires: [02-01]
  provides: ["GET /api/ships", "GET /api/ships/[id]"]
  affects: [02-03, 05-ship-ui]
tech-stack:
  added: []
  patterns: ["Zod query param validation", "public Cache-Control headers", "UUID-or-slug dynamic routing"]
key-files:
  created:
    - src/app/api/ships/route.ts
    - src/app/api/ships/[id]/route.ts
  modified: []
decisions:
  - id: "02-02-zod-validation"
    description: "Zod with z.coerce for query param validation instead of manual parseInt"
  - id: "02-02-cache-control"
    description: "public, max-age=300, stale-while-revalidate=60 for both ship endpoints"
metrics:
  duration: "~1 min"
  completed: "2026-02-03"
---

# Phase 2 Plan 2: Ship List & Single Ship API Routes Summary

**One-liner:** GET /api/ships with Zod-validated pagination/filters and GET /api/ships/[id] with UUID-or-slug lookup, both publicly cached.

## What Was Built

### GET /api/ships (Ship List Endpoint)
- Paginated ship list endpoint at `src/app/api/ships/route.ts`
- Zod schema validates and coerces all query parameters:
  - `page` (default: 1), `pageSize` (default: 25, max: 100)
  - `manufacturer`, `size`, `classification`, `productionStatus` (optional string filters)
  - `search` (optional text search, min 1 char)
- Returns 400 with detailed Zod error messages on invalid params
- Delegates to `shipStorage.findShips()` for all DB work (no in-memory filtering)
- Cache-Control: `public, max-age=300, stale-while-revalidate=60`
- No authentication required

### GET /api/ships/[id] (Single Ship Endpoint)
- Single ship lookup at `src/app/api/ships/[id]/route.ts`
- Accepts FleetYards UUID or URL slug as the `[id]` dynamic segment
- UUID-vs-slug detection handled internally by `shipStorage.getShipByIdOrSlug()`
- Returns 404 with `{ error: 'Ship not found' }` when no match
- Returns 400 when id param is empty
- Next.js 15 async params pattern: `const { id } = await params`
- Cache-Control: `public, max-age=300, stale-while-revalidate=60`
- No authentication required

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Zod with `z.coerce` for query params | Type-safe coercion from URL strings with automatic defaults and detailed error messages, replacing manual `parseInt` pattern |
| 300s public cache with 60s stale-while-revalidate | Ship data changes only on sync (~24h interval), so 5-min cache is safe; stale-while-revalidate provides instant responses during revalidation |
| No authentication on either endpoint | Ship data is public reference data from FleetYards, consistent with data being freely available on fleetyards.dev |
| Error messages use `[ships]` prefix | Consistent with existing logging patterns like `[ship-storage]` for log filtering |

## Deviations from Plan

None -- plan executed exactly as written.

## Commit Log

| Task | Commit | Message |
|------|--------|---------|
| 1 | `2fe16e5` | feat(02-02): add GET /api/ships endpoint with Zod-validated query params |
| 2 | `aca256a` | feat(02-02): add GET /api/ships/[id] endpoint with UUID-or-slug lookup |

## Verification Results

- TypeScript type-check passes with no errors
- Both route files export a GET function
- Neither route imports auth-related modules (getServerSession, authOptions, next-auth)
- Both routes set Cache-Control headers
- Ship list route uses Zod for parameter validation

## Next Phase Readiness

Plan 02-03 (filter metadata endpoint) can proceed. It depends on:
- `shipStorage.getManufacturers()` (delivered in 02-01)
- The aggregation pattern established here for consistent API response shapes

No blockers or concerns introduced by this plan.
