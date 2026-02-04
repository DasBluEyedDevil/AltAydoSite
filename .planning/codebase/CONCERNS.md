# Codebase Concerns

**Analysis Date:** 2026-02-03

## Tech Debt

**Hybrid Storage System Complexity:**
- Issue: Dual MongoDB/local JSON fallback creates data consistency risks. Code must handle two divergent paths for every database operation.
- Files: `src/lib/storage-utils.ts`, `src/lib/planned-mission-storage.ts`, `src/lib/user-storage.ts`, `src/app/api/fleet-ops/missions/route.ts`
- Impact: Silent data divergence when fallback triggers. Operations may succeed on local storage but fail when MongoDB reconnects. Users see stale data depending on which storage layer is active.
- Fix approach: Migrate fully to MongoDB in production. Keep local JSON only for development/testing. Add data sync verification endpoint to detect divergence.

**Large Component Files:**
- Issue: Multiple monolithic React components exceed 1000+ lines, mixing state management with rendering logic.
- Files:
  - `src/components/dashboard/MissionPlanner.tsx` (1211 lines)
  - `src/components/fleet-ops/mission-planner/MissionForm.tsx` (1178 lines)
  - `src/components/dashboard/MissionPlannerForm.tsx` (1090 lines)
  - `src/components/HomeContent.tsx` (921 lines)
- Impact: Difficult to test individual features. Refactoring risks breaking unrelated functionality. State management becomes hard to trace.
- Fix approach: Extract state management into custom hooks. Split rendering into smaller subcomponents. Use composition pattern to organize logic.

**Console Logging Scattered Throughout:**
- Issue: Excessive `console.log()` and `console.error()` calls in production code without structured logging.
- Files: `src/lib/planned-mission-storage.ts`, `src/app/api/planned-missions/route.ts`, `src/middleware.ts`, and many others
- Impact: No way to control log verbosity in production. Security-sensitive operations may be exposed in logs (like auth failures).
- Fix approach: Implement structured logging framework (Winston, Pino, or Bunyan). Replace `console.*` with `logger.info()`, `logger.error()`, etc.

## Known Bugs

**Authentication Middleware Edge Case:**
- Symptoms: Fallback handling in middleware returns `NextResponse.redirect()` on auth error, but doesn't validate that callback URL is safe
- Files: `src/middleware.ts` (lines 37-43)
- Trigger: User is authenticated but NEXTAUTH_SECRET is mismatched or JWT verification fails
- Workaround: Middleware catches the error and redirects to login, but an open redirect is possible if `callbackUrl` parameter is malicious
- Fix: Validate `callbackUrl` is relative path before adding to redirect

**Storage Fallback Status Not Thread-Safe:**
- Symptoms: Race condition in planned missions where two concurrent requests might trigger fallback differently
- Files: `src/lib/planned-mission-storage.ts` (line 12: `let usingFallbackStorage = false`)
- Trigger: Multiple API requests hit simultaneously while MongoDB connection is unstable
- Workaround: System eventually stabilizes to one storage mode, but intermediate state is inconsistent
- Fix: Use atomic check-and-set instead of boolean flag. Track per-request state instead of global state.

**Discord Event RSVP Fetch Not Retried:**
- Symptoms: If Discord API call fails during mission fetch, RSVP data is silently absent (empty object)
- Files: `src/components/dashboard/MissionPlanner.tsx` (lines 99-130)
- Trigger: Discord service temporarily unavailable
- Workaround: None. UI shows incomplete mission data but doesn't indicate why.
- Fix: Add retry logic with exponential backoff. Show user-friendly error if Discord data unavailable.

## Security Considerations

**Authorization Bypass Risk in Mission Endpoints:**
- Risk: `canUserModifyMission()` and `canUserDeleteMission()` checks depend on user.id matching createdBy field. No role-based access control for operations managers/admins.
- Files: `src/app/api/planned-missions/[id]/route.ts`, `src/lib/planned-mission-storage.ts`
- Current mitigation: Clearance level check for creating missions (level 3+ required). Creator ownership check for modification.
- Recommendations:
  1. Add role-based overrides (admins can modify any mission)
  2. Log all mission modifications for audit trail
  3. Add clearance level check for viewing sensitive mission details (briefing, equipment notes)

**Discord Token Exposure:**
- Risk: Discord `access_token` passed directly in OAuth callback without immediate consumption
- Files: `src/app/api/auth/auth.ts` (line 85)
- Current mitigation: Token is from NextAuth which handles it securely
- Recommendations:
  1. Document token lifecycle and scope limitations
  2. Add token refresh mechanism if permissions change
  3. Rotate Discord bot token if any audit logs show unauthorized access

**Clearance Level Enumeration:**
- Risk: User clearance levels (1-5) are predictable. No permission boundary validation if someone manipulates session token.
- Files: `src/app/api/planned-missions/route.ts` (line 260), `src/app/api/auth/auth.ts` (line 260)
- Current mitigation: Session token signature verified by NextAuth
- Recommendations:
  1. Validate clearance level hasn't changed between requests (check database)
  2. Add audit logging when high-level operations performed (clearance 4+)
  3. Implement request signing for sensitive endpoints

**Local Storage Contains Sensitive Mission Data:**
- Risk: If deployment falls back to local JSON storage, mission briefings and equipment notes are stored unencrypted on disk
- Files: `src/lib/planned-mission-storage.ts` (line 58), `data/planned-missions.json` (runtime generated)
- Current mitigation: Local storage is "fallback only" for development
- Recommendations:
  1. Never deploy to production without working MongoDB
  2. Add encryption layer if local storage is ever used in staging
  3. Clear data/` directory before deploying

## Performance Bottlenecks

**Mission List Fetch Has No Pagination Limit:**
- Problem: `getAllPlannedMissions()` can return thousands of items. Pagination happens in memory, not in database query.
- Files: `src/lib/planned-mission-storage.ts` (lines 182), `src/app/api/planned-missions/route.ts` (lines 224-228)
- Cause: MongoDB query loads all matching documents into memory, then JavaScript slices them. No `.skip().limit()` in query.
- Improvement path: Push pagination to MongoDB query layer. Set reasonable defaults (pageSize max 200 is enforced, but query still loads everything).

**Discord Event RSVP Fetching Unbounded:**
- Problem: For every published mission in list, a separate fetch to Discord API happens synchronously
- Files: `src/components/dashboard/MissionPlanner.tsx` (lines 99-130, likely within loop)
- Cause: RSVP fetch initiated for each mission without batching or rate-limit awareness
- Improvement path: Batch Discord API calls. Cache RSVP data with 1-minute TTL. Fetch in background while showing stale data.

**Ship Database Loaded on Every Component Mount:**
- Problem: `loadShipDatabase()` reads from static file/memory on component render
- Files: `src/components/dashboard/MissionPlanner.tsx` (line 22)
- Cause: No memoization. Ship data reloads even if user navigates away and back
- Improvement path: Store ship database in React context or global store. Lazy-load on first use only.

**Image Upload Has No Size Validation:**
- Problem: Images uploaded without checking file size or format server-side before processing
- Files: `src/app/api/fleet-ops/operations/upload-image/route.ts`
- Cause: Form validation happens client-side only
- Improvement path: Add server-side file size limit (e.g., 5MB). Validate MIME type. Stream to disk instead of loading into memory.

## Fragile Areas

**Mission State Machine Not Validated:**
- Files: `src/types/PlannedMission.ts`, `src/lib/planned-mission-storage.ts`
- Why fragile: No validation of state transitions (e.g., DRAFT → COMPLETED is not validated; can jump directly). Status change logic scattered across multiple components.
- Safe modification: Centralize state machine. Create `canTransitionTo(currentStatus, targetStatus)` function. Add tests for each valid transition.
- Test coverage: No tests found for mission status transition logic.

**Discord Integration Error Handling:**
- Files: `src/app/api/planned-missions/route.ts` (lines 38-79), `src/lib/discord.ts`
- Why fragile: Discord API failures are silently caught and logged but don't propagate. Mission saves succeed even if Discord event creation fails.
- Safe modification: Make Discord publish errors explicit. Return `discordError` in response so client knows to retry.
- Test coverage: No tests for Discord API failure scenarios.

**User Authentication With Fallback:**
- Files: `src/app/api/auth/auth.ts` (lines 78-136)
- Why fragile: Discord OAuth fallback uses `getUserByEmail()` as secondary lookup. If two Discord users claim same email, behavior is unpredictable.
- Safe modification: Require email verification for OAuth users before creating account. Log email conflicts to alert admin.
- Test coverage: No tests for email conflict handling.

**Concurrent Mission Edits Not Prevented:**
- Files: `src/lib/planned-mission-storage.ts`, `src/components/dashboard/MissionPlanner.tsx`
- Why fragile: No optimistic locking or version tracking. Two users editing same mission simultaneously causes last-write-wins data loss.
- Safe modification: Add `version` field to missions. Check version on update. Return conflict error if version mismatch.
- Test coverage: No tests for concurrent edit scenarios.

## Scaling Limits

**MongoDB Pool Size Hardcoded:**
- Current capacity: maxPoolSize = 100 connections (line 26 `src/lib/mongodb.ts`)
- Limit: At >100 concurrent database operations, additional requests queue or timeout
- Scaling path: Make pool size configurable via environment variable. Monitor connection usage. Increase for production (200-500 depending on load).

**Discord API Rate Limits Not Tracked:**
- Current capacity: No rate-limit headers are read from Discord API responses
- Limit: After ~50 API calls per minute, Discord starts rate-limiting. No backoff implemented.
- Scaling path: Implement rate-limit tracking. Return 429 status if near limit. Use exponential backoff for retries.

**Image Storage on Filesystem:**
- Current capacity: No disk space management. Images accumulate in `data/` directory indefinitely.
- Limit: After ~100GB (on typical deployments), disk fills up. No automatic cleanup.
- Scaling path: Implement image expiration (auto-delete after 90 days). Use cloud storage (Azure Blob) instead of local filesystem.

**In-Memory Ship Database:**
- Current capacity: Ship compendium loaded entirely into memory at first access
- Limit: If ship database grows to 10,000+ entries, memory footprint becomes significant
- Scaling path: Load ship data lazily or paginate. Consider database-backed ship catalog instead of static file.

## Dependencies at Risk

**Next.js 15.3.3 (Major Version Freshness):**
- Risk: Using very recent Next.js version. Fewer bug reports and workarounds available in community.
- Impact: Breaking changes possible in minor updates. Custom webpack config may not work with future versions.
- Migration plan: Pin to 15.3.3. Test thoroughly before upgrading major versions. Monitor Next.js security releases.

**MongoDB Driver ^6.16.0 (Broad Version Range):**
- Risk: Caret version allows 6.x upgrades automatically. Breaking API changes between 6.x versions could introduce bugs.
- Impact: `npm install` might pull incompatible driver version. Connection pooling behavior may change.
- Migration plan: Narrow to exact version or minor range (e.g., `~6.16.0`). Test database operations after any driver update.

**Discord.js ^14.22.1 (Active but Rapidly Evolving):**
- Risk: Discord API changes frequently. Discord.js follows with breaking changes between minor versions.
- Impact: Gateway intents might change. Event handling could break. Scheduled events API may change.
- Migration plan: Monitor Discord.js releases. Test Discord integration endpoints after any update. Join Discord.js community for announcements.

**Azure Cosmos DB Dependencies (Deprecated Comment):**
- Risk: Code imports from `@azure/cosmos` but comment in CLAUDE.md indicates migration to MongoDB was completed.
- Impact: Unused dependency adds bundle size. Potential security issues in unmaintained package.
- Migration plan: Remove all `@azure/cosmos` imports if fully migrated. Update documentation.

## Missing Critical Features

**No Session Timeout Reminder:**
- Problem: JWT tokens expire after 30 days. Users on long-running pages won't know they're logged out until they try to edit something.
- Blocks: Users lose unsaved work. No graceful session refresh.
- Fix: Implement session timeout warning at 15-minute mark before expiry.

**No Audit Trail for Mission Changes:**
- Problem: Mission edits don't log who changed what and when. No way to track history.
- Blocks: Can't investigate data quality issues. No recovery from accidental deletions.
- Fix: Create `mission_audit_log` collection. Log every create/update/delete with timestamp, user, and old/new values.

**No Rate Limiting on API Endpoints:**
- Problem: No protection against brute force or DoS attacks on public endpoints.
- Blocks: Signup, login, and API endpoints are vulnerable to abuse.
- Fix: Implement rate limiting middleware using Redis or in-memory store. Limit by IP and user ID.

**No Error Recovery for Failed Discord Sync:**
- Problem: If Discord sync fails during mission creation, mission exists but isn't advertised.
- Blocks: Users expect scheduled missions to auto-publish to Discord.
- Fix: Add background job queue (Bull, Quirk) to retry Discord publishes. Check for orphaned missions without Discord events.

## Test Coverage Gaps

**Mission Status Transitions:**
- What's not tested: State machine for mission status changes (DRAFT → SCHEDULED → ACTIVE → COMPLETED)
- Files: `src/lib/planned-mission-storage.ts`, `src/types/PlannedMission.ts`
- Risk: Invalid state transitions accepted silently. Example: allowing COMPLETED mission to go back to DRAFT.
- Priority: High

**Storage Layer Fallback:**
- What's not tested: Behavior when MongoDB fails and local JSON fallback activates. Data consistency between layers.
- Files: `src/lib/planned-mission-storage.ts`, `src/lib/user-storage.ts`
- Risk: Unknown failure modes when switching storage layers. Potential data loss if fallback is partial.
- Priority: High

**Concurrent Request Handling:**
- What's not tested: Two simultaneous requests to create/update same mission. Race conditions in state management.
- Files: `src/components/dashboard/MissionPlanner.tsx`, API routes
- Risk: Last-write-wins data loss. Inconsistent state between client and server.
- Priority: Medium

**Discord API Failures:**
- What's not tested: Behavior when Discord API is unavailable, rate-limited, or returns errors.
- Files: `src/lib/discord.ts`, `src/app/api/planned-missions/route.ts`
- Risk: Silent failures. Missions appear created but aren't advertised to Discord.
- Priority: Medium

**Authentication Edge Cases:**
- What's not tested: User login with expired tokens, password reset flow, Discord OAuth with missing email, Discord with conflicting email.
- Files: `src/app/api/auth/auth.ts`, `src/app/api/auth/reset-password/route.ts`
- Risk: Account lockout scenarios. OAuth users unable to login due to email conflicts.
- Priority: High

**Image Upload Validation:**
- What's not tested: Large file uploads, invalid MIME types, concurrent image uploads, disk space exhaustion.
- Files: `src/app/api/fleet-ops/operations/upload-image/route.ts`
- Risk: DoS via large files. Corrupted images breaking page load.
- Priority: Medium

**Permission Boundary Validation:**
- What's not tested: User with clearance level 2 attempting level 3+ actions, admin overrides, cross-user access checks.
- Files: `src/app/api/planned-missions/route.ts`, `src/lib/planned-mission-storage.ts`
- Risk: Authorization bypass. Users modifying other users' missions.
- Priority: High

---

*Concerns audit: 2026-02-03*
