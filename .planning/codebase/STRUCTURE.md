# Codebase Structure

**Analysis Date:** 2026-02-03

## Directory Layout

```
AltAydoSite/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── page.tsx            # Home page
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── api/                # API route handlers
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── fleet-ops/      # Fleet operations API
│   │   │   ├── planned-missions/  # Mission planning API
│   │   │   ├── users/          # User list/management
│   │   │   ├── discord/        # Discord integration
│   │   │   └── [other domains]
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── mission-planner/
│   │   │   ├── operations/
│   │   │   ├── events/
│   │   │   └── [other features]
│   │   ├── about/              # Public info pages
│   │   ├── services/
│   │   ├── contact/
│   │   └── [other public routes]
│   ├── components/             # React components
│   │   ├── ui/mobiglas/        # MobiGlas design system UI components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── fleet-ops/          # Fleet operations components
│   │   ├── auth/               # Auth forms (login, signup)
│   │   ├── providers/          # Context providers
│   │   └── [feature-based organization]
│   ├── lib/                    # Core libraries and utilities
│   │   ├── mongodb.ts          # MongoDB connection setup
│   │   ├── mongodb-client.ts   # MongoDB client pool
│   │   ├── storage-utils.ts    # Storage abstraction
│   │   ├── *-storage.ts        # Entity storage (user, operation, mission, etc.)
│   │   ├── auth.ts             # Auth helper utilities
│   │   ├── discord*.ts         # Discord integration modules
│   │   ├── email-service.ts    # Email/Nodemailer integration
│   │   ├── mission-builder/    # Mission building utilities
│   │   └── [domain logic]
│   ├── types/                  # TypeScript type definitions
│   │   ├── user.ts             # User interface
│   │   ├── PlannedMission.ts   # Mission planning types
│   │   ├── ShipData.ts         # Ship compendium types
│   │   └── [entity types]
│   ├── hooks/                  # Custom React hooks
│   │   ├── useUserProfile.ts
│   │   ├── useEvents.ts
│   │   └── [domain hooks]
│   ├── scripts/                # Administrative scripts
│   │   ├── migrate-users.ts
│   │   ├── generate-password.ts
│   │   └── [migration/utility scripts]
│   └── utils/                  # General utility functions
│
├── data/                       # Local JSON file storage (fallback)
│   ├── users.json
│   ├── missions.json
│   ├── operations.json
│   └── [other entity files]
│
├── public/                     # Static assets
│   ├── fonts/                  # Custom fonts (Quantify)
│   └── assets/                 # Images, SVGs
│
├── .planning/                  # Planning documents
│   └── codebase/               # Architecture docs
│
├── package.json                # Dependencies, scripts
├── tsconfig.json               # TypeScript configuration (with @/* alias)
├── tailwind.config.js          # Tailwind CSS customization
├── next.config.js              # Next.js build config (missing, inferred)
└── .env.local.example          # Environment template

```

## Directory Purposes

**src/app:**
- Purpose: Next.js App Router entry point - all pages and API routes
- Contains: Page components, layout wrapping, route handlers
- Key files: `layout.tsx` (root layout with providers), `page.tsx` (home)

**src/app/api:**
- Purpose: Backend API endpoints following Next.js conventions
- Contains: HTTP request handlers (GET, POST, PUT, DELETE)
- Organization: Subdirectories by domain (auth, fleet-ops, discord, etc.)
- Pattern: Each route is `route.ts` or `route.js` in its directory path

**src/app/dashboard:**
- Purpose: Protected authenticated user area
- Contains: Feature pages (mission-planner, operations, events, finance-tracker)
- Authentication: Requires session via `useSession()`

**src/components:**
- Purpose: Reusable React components
- Organization: Feature-based subdirectories (dashboard, fleet-ops, auth, etc.) plus UI system
- Key: `ui/mobiglas/` contains design system components (MobiGlasPanel, MobiGlasButton, etc.)

**src/lib:**
- Purpose: Core business logic, integrations, utilities
- Storage modules: Each entity type (user, operation, mission) has dedicated `*-storage.ts` file
- Database: `mongodb.ts` (connection), `mongodb-client.ts` (client management)
- Integrations: Discord (`discord.ts`, `discord-oauth.ts`, `discord-role-mappings.ts`, `discord-user-sync.ts`)
- Domain logic: `mission-builder/` for mission composition, `email-service.ts` for notifications

**src/types:**
- Purpose: TypeScript interface definitions
- Key files:
  - `user.ts` - User and UserSession interfaces
  - `PlannedMission.ts` - Mission types (MissionShip, MissionLeader, ExpectedParticipant, ConfirmedParticipant)
  - `ShipData.ts` - Ship compendium types
  - `MissionTemplate.ts`, `Operation.ts`, `Resource.ts`, etc.

**src/hooks:**
- Purpose: Custom React hooks
- Examples: `useUserProfile` (fetch user data), `useEvents` (fetch Discord events), `useUserTimezone`

**src/scripts:**
- Purpose: Administrative tasks, one-off migrations, utilities
- Examples: `migrate-users.ts`, `generate-password.ts`, `verify-cosmos.ts`, `assign-synced-role.ts`

**data:**
- Purpose: Local JSON file fallback storage when MongoDB unavailable
- Files: `users.json`, `missions.json`, `operations.json`, `resources.json`, `resource-allocations.json`, `mission-templates.json`
- Lifecycle: Created automatically by storage modules if missing

**public:**
- Purpose: Static assets served directly
- Contains: Custom fonts (Quantify), images, SVGs
- Path: Accessible via `/fonts/`, `/assets/` URLs

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` - Home page
- `src/app/layout.tsx` - Root layout wrapping all pages
- `src/app/dashboard/page.tsx` - Main dashboard hub
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler

**Configuration:**
- `tsconfig.json` - TypeScript config with `@/*` → `./src/*` alias
- `tailwind.config.js` - Tailwind CSS customization
- `package.json` - Dependencies, npm scripts
- `.env.local` - Runtime environment variables

**Core Logic:**
- `src/lib/mongodb.ts` - Database connection setup
- `src/app/api/auth/auth.ts` - NextAuth configuration with providers
- `src/lib/user-storage.ts` - User CRUD operations
- `src/lib/planned-mission-storage.ts` - Mission planning storage (MongoDB + JSON)

**UI System:**
- `src/components/ui/mobiglas/` - MobiGlas design system components
- `src/components/layout/` (implied) - Layout components (Navigation, Profile, Footer)

**Testing/Verification:**
- `src/scripts/test-cosmos-connection.ts` - Test database connectivity
- `src/scripts/verify-cosmos.ts` - Verify Cosmos DB setup

## Naming Conventions

**Files:**
- camelCase for component files: `MissionPlanner.tsx`, `UserProfilePanel.tsx`
- camelCase for utility/lib files: `user-storage.ts`, `discord-oauth.ts`
- camelCase for hooks: `useUserProfile.ts`, `useEvents.ts`
- SCREAMING_SNAKE_CASE for constants: `STATUS_COLORS` in component files

**Directories:**
- kebab-case for directories: `fleet-ops/`, `mission-planner/`, `mission-builder/`
- Feature-based grouping: `auth/`, `dashboard/`, `discord/`, `security/`

**Types/Interfaces:**
- PascalCase: `User`, `PlannedMission`, `Operation`, `ShipDetails`
- Suffixes for clarity: `Response` (API response), `Params`, `Schema`

**API Routes:**
- Next.js convention: Filename `route.ts`, methods are `GET`, `POST`, `PUT`, `DELETE` exports
- URL structure mirrors directory: `/api/fleet-ops/operations/` → `src/app/api/fleet-ops/operations/route.ts`
- Dynamic routes in brackets: `[id]` for `/api/resource/[id]` → `src/app/api/resource/[id]/route.ts`

## Where to Add New Code

**New Feature (User-Facing):**
- Primary code: `src/app/dashboard/[feature]/page.tsx` (page) + `src/components/dashboard/[Feature].tsx` (component logic)
- State: Use React useState in component, lift to context if shared widely
- Tests: (Not configured in current stack)
- Styling: Tailwind classes in component JSX + custom CSS vars for MobiGlas theme

**New API Endpoint:**
- Create: `src/app/api/[domain]/[entity]/route.ts`
- Validation: Zod schema defined inline in route handler
- Storage: Use existing `*-storage.ts` module (create new if entity type is new)
- Auth: `const session = await getServerSession(authOptions)` at handler start
- Response: `NextResponse.json({ data }, { status: code })`

**New Storage Entity (Database):**
- Create: `src/lib/[entity]-storage.ts`
- Implement: CRUD functions (get, create, update, delete, list with filters)
- Use: `connectToDatabase()` for MongoDB, local JSON fallback in same module
- Export: Named functions (not default), async pattern
- Type: Create corresponding `src/types/[Entity].ts` interface

**New Component:**
- Path: `src/components/[domain]/[ComponentName].tsx` for feature-specific, or `src/components/[ComponentName].tsx` for reusable
- Pattern: `'use client'` if needs hooks/interactivity, no directive if just JSX
- Styling: Tailwind + custom variables (e.g., `bg-[rgba(var(--mg-primary),0.2)]`)
- Imports: Use `@/` alias for imports (resolves to `src/`)

**New Custom Hook:**
- Location: `src/hooks/use[Feature].ts`
- Pattern: export default function (not const), camelCase name
- Usage: `const data = useFeature()`

**Utilities:**
- Shared helpers: `src/utils/[purpose].ts` or within `src/lib/` if domain-specific
- Type-safe: Strong TypeScript types, no `any` type
- Export: Named exports, compose small functions

## Special Directories

**src/app/api/auth:**
- Purpose: All authentication routes
- Generated: No (manually written)
- Committed: Yes

**data/:**
- Purpose: Local JSON storage fallback
- Generated: Yes (created by storage modules if missing)
- Committed: No (.gitignored)

**.next/:**
- Purpose: Next.js build output
- Generated: Yes (from `npm run build`)
- Committed: No (.gitignored)

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (from package.json)
- Committed: No (.gitignored)

**.planning/codebase/:**
- Purpose: Architecture documentation
- Generated: No (manually written/updated)
- Committed: Yes

## Key Import Paths

**Aliases:**
- `@/app` → `src/app`
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/types` → `src/types`
- `@/hooks` → `src/hooks`
- `@/utils` → `src/utils`

**Example usage:**
```typescript
import { User } from '@/types/user';
import * as userStorage from '@/lib/user-storage';
import { MobiGlasPanel } from '@/components/ui/mobiglas';
import { useUserProfile } from '@/hooks/useUserProfile';
```

---

*Structure analysis: 2026-02-03*
