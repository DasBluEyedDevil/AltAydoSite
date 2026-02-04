# Architecture

**Analysis Date:** 2026-02-03

## Pattern Overview

**Overall:** Next.js 15 App Router with hybrid storage (MongoDB/Cosmos DB primary, JSON fallback)

**Key Characteristics:**
- Server-side rendering with client components for interactivity
- API layer with authentication and authorization checks
- Dual-database strategy (MongoDB with local JSON fallback)
- Clearance-based access control system (levels 1-5)
- Complex state management for mission planning features

## Layers

**Presentation Layer:**
- Purpose: User interface components and pages rendered via Next.js App Router
- Location: `src/app/`, `src/components/`
- Contains: Page components, feature components, UI elements (MobiGlas design system)
- Depends on: Authentication (NextAuth), User context, API routes
- Used by: End users via browser

**API/Server Layer:**
- Purpose: HTTP endpoints handling business logic, authentication, data operations
- Location: `src/app/api/`
- Contains: Route handlers following Next.js App Router conventions
- Depends on: Storage layer, authentication, Discord integration
- Used by: Frontend, external integrations, cron jobs

**Storage/Data Access Layer:**
- Purpose: Abstract database operations and fallback mechanisms
- Location: `src/lib/*-storage.ts`, `src/lib/mongodb.ts`, `src/lib/local-storage.ts`
- Contains: CRUD operations for entities (users, missions, operations, resources)
- Depends on: MongoDB client, file system
- Used by: API routes, server-side components

**Business Logic Layer:**
- Purpose: Domain-specific operations (Discord integration, email, validation)
- Location: `src/lib/` (mission-builder, discord*, email-service.ts, etc.)
- Contains: Discord OAuth, role mapping, user synchronization
- Depends on: External APIs (Discord), storage layer
- Used by: API routes, components

**Authentication & Authorization:**
- Purpose: Session management, user verification, permission checking
- Location: `src/app/api/auth/auth.ts`, `src/lib/auth.ts`
- Contains: NextAuth configuration, credential/Discord providers, session callbacks
- Depends on: User storage, Discord provider
- Used by: All protected routes and components

## Data Flow

**User Authentication Flow:**

1. User submits credentials (Credentials Provider) or Discord OAuth
2. `auth.ts` validates via `getUserByHandle()` or `getUserByDiscordId()`
3. Password verified via bcrypt comparison
4. Session created with user metadata (id, handle, role, clearanceLevel)
5. Session stored and managed by NextAuth
6. Client-side `useSession()` hook provides session context

**Mission Planning Flow:**

1. User creates/edits mission via `MissionPlanner.tsx` (complex React state)
2. Form data collected and validated against `createEmptyMission()` template
3. Submitted to `/api/planned-missions` POST endpoint
4. Server validates with Zod schema
5. Data stored via `savePlannedMission()` to MongoDB then JSON fallback
6. Mission published to Discord as event
7. Discord RSVPs fetched and synced to `ExpectedParticipant` list
8. Post-mission: Debrief marks `ConfirmedParticipant` attendance

**Fleet Operations Data Flow:**

1. Operations CRUD via `/api/fleet-ops/operations/` routes
2. User selection through filtered dropdown (users via `/api/users`)
3. Ship data loaded from `src/lib/ship-data.ts` (compendium)
4. Resources allocated via `/api/fleet-ops/resources/allocations`
5. Images uploaded to `/api/fleet-ops/operations/upload-image`
6. All stored in MongoDB with JSON fallback

**State Management:**

- Session state: NextAuth SessionProvider (global)
- User context: UserContext via `UserProviderWrapper` (global)
- Component state: React useState for local UI state (MissionPlanner, forms)
- No Redux/Zustand - state kept close to usage point

## Key Abstractions

**Storage Abstraction:**
- Purpose: Unified interface hiding MongoDB vs JSON file storage
- Examples: `src/lib/user-storage.ts`, `src/lib/operation-storage.ts`, `src/lib/planned-mission-storage.ts`
- Pattern: Each entity type has dedicated storage module with same interface (get, create, update, delete, list operations)
- Implementation: Try MongoDB first, fallback to JSON files on connection failure

**Database Connection Management:**
- Purpose: Centralized MongoDB client lifecycle
- Examples: `src/lib/mongodb.ts`, `src/lib/mongodb-client.ts`
- Pattern: Singleton pattern with global reference in development (HMR-safe), new connection in production
- Indexes: Automatically created/verified on connection via `ensureMongoIndexes()`

**Entity Storage Modules:**
- User data: `src/lib/user-storage.ts` - getUserById, createUser, updateUser, getUserByHandle, getUserByDiscordId
- Operations: `src/lib/operation-storage.ts` - CRUD for fleet operations
- Missions: `src/lib/mission-storage.ts`, `src/lib/planned-mission-storage.ts` - Mission templates and planned instances
- Resources: `src/lib/resource-storage.ts` - Fleet resources and allocations
- Escorts: `src/lib/escort-request-storage.ts` - Security escort requests
- Finance: `src/lib/finance.ts` - Financial transactions

**Discord Integration:**
- Purpose: Oauth authentication, role mapping, event synchronization
- Examples: `src/lib/discord.ts`, `src/lib/discord-oauth.ts`, `src/lib/discord-role-mappings.ts`
- Pattern: Provider pattern via NextAuth for OAuth, separate modules for role monitoring and user sync
- Callbacks: Async handlers for sign-in, session, and JWT token updates

**Validation:**
- Purpose: Schema validation at API boundaries
- Pattern: Zod schemas defined inline in route handlers
- Examples: `createOperationSchema`, `operationParticipantSchema` in `/api/fleet-ops/operations/route.ts`

## Entry Points

**Main Website:**
- Location: `src/app/page.tsx`
- Triggers: Root URL access
- Responsibilities: Renders home page, checks session, shows welcome or dashboard link

**Authentication Routes:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: Login, signup, logout, Discord OAuth callback
- Responsibilities: Session creation, credential validation, Discord sync

**Dashboard:**
- Location: `src/app/dashboard/page.tsx`
- Triggers: Authenticated user navigates to /dashboard
- Responsibilities: Main hub, renders sidebars and content panels

**Mission Planner:**
- Location: `src/app/dashboard/mission-planner/page.tsx` → `src/components/dashboard/MissionPlanner.tsx`
- Triggers: User creates or edits planned mission
- Responsibilities: Complex form UI, mission template selection, Discord integration

**API Routes (Examples):**
- `/api/users` - List users with pagination, clearance filtering
- `/api/fleet-ops/operations` - CRUD operations (GET list, POST create, etc.)
- `/api/planned-missions` - Mission planning CRUD
- `/api/discord/roles` - Get Discord roles for user
- `/api/discord/init` - Initialize Discord integration

## Error Handling

**Strategy:** Try-catch blocks at API boundaries, NextResponse.json() for standardized error responses

**Patterns:**

1. **API Route Errors:**
   ```typescript
   // Unauthorized access
   if (!session || !session.user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   // Validation errors
   const validationResult = schema.safeParse(body);
   if (!validationResult.success) {
     return NextResponse.json({ error: errorMessage }, { status: 400 });
   }

   // Server errors
   catch (error: any) {
     console.error('Error description:', error);
     return NextResponse.json(
       { error: `Failed operation: ${error.message}` },
       { status: 500 }
     );
   }
   ```

2. **Storage Fallback:**
   - MongoDB connection errors caught in `ensureDatabaseConnection()`
   - Falls back to JSON file storage automatically
   - Logged with `STORAGE:` prefix for debugging

3. **Component Error Boundaries:**
   - `ClientErrorBoundary` (client-side, dynamic import)
   - `ServerErrorBoundary` (server-side)
   - Catch rendering errors before crashing page

4. **Validation Errors:**
   - Zod schemas provide detailed error messages
   - Returned to client with 400 status
   - No sensitive data leaked in error messages

## Cross-Cutting Concerns

**Logging:** Console logging with semantic prefixes (AUTH:, STORAGE:, ERROR:, etc.) in `src/lib/logger.ts`

**Validation:** Zod schemas at API boundaries, strong TypeScript typing throughout

**Authentication:** NextAuth.js with Credentials and Discord providers, clearance level checks on protected routes

**Rate Limiting:** Simple rate limiter in `src/lib/rate-limiter.ts` for sensitive endpoints

**CORS & Security:** Headers configured in API routes, NextAuth session handling, clearance-based access control

**Email:** Nodemailer integration in `src/lib/email-service.ts` for password resets, contact forms

**Discord Integration:** Dual-mode (OAuth via NextAuth, separate bot integration for role monitoring)

---

*Architecture analysis: 2026-02-03*
