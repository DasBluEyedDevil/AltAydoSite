# Coding Conventions

**Analysis Date:** 2026-02-03

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `AboutHero.tsx`, `ErrorBoundary.tsx`)
- Library/utility files: kebab-case (e.g., `user-storage.ts`, `email-service.ts`, `local-storage.ts`)
- API route files: Use `route.ts` at the end of directory path (e.g., `src/app/api/auth/signup/route.ts`)
- Type definition files: Lower kebab-case (e.g., `mission-builder.ts`, `password-reset.ts`) or camelCase (e.g., `errorReporting.ts`)

**Functions:**
- Async functions (API handlers, storage operations): camelCase prefixed with action verb (e.g., `getUserById`, `createUser`, `sendContactFormEmail`)
- Event handlers: camelCase prefixed with `on` (e.g., `onInitializeDataFeed`)
- Custom hooks: camelCase prefixed with `use` (e.g., `useUserProfile`, `useUserTimezone`, `useEvents`)
- Private helper functions: camelCase with leading underscore if needed internally
- Logging functions: camelCase with module prefix (e.g., `logInfo`, `logError`, `logDebug`)

**Variables:**
- Local variables and state: camelCase (e.g., `scrollPosition`, `profileKey`, `hashedPassword`)
- Constants (module-level): SCREAMING_SNAKE_CASE (e.g., `DATA_DIR`, `USERS_FILE`, `MAX_ERROR_LOG`, `PROFILE_VERSION`)
- Boolean flags: Prefix with `is` or `has` (e.g., `isLoading`, `isUsingFallback`, `hasDiscordId`)
- State variables from React hooks: camelCase (e.g., `profile`, `isLoading`, `savedProfile`)

**Types & Interfaces:**
- Interfaces: PascalCase (e.g., `User`, `UserResponse`, `MissionDraft`, `LogEntry`)
- Type aliases: PascalCase (e.g., `BuilderMissionType`, `BuilderMissionStatus`, `ObjectiveType`, `Waypoint`)
- Union types: PascalCase with descriptive names (e.g., `LogLevel`, `ErrorLogEntry`)
- Generic type parameters: Single uppercase letter or descriptive PascalCase (e.g., `T`, `K`, `V`)

## Code Style

**Formatting:**
- Configured via ESLint (not Prettier detected)
- ESLint config: `next/core-web-vitals` with TypeScript parser support (`tsconfig.json`)
- Target: ES2017 with strict TypeScript checking enabled

**Linting:**
- Tool: ESLint 8.57.0
- Config files: `.eslintrc.json` and `.eslintrc.js` (next/core-web-vitals rules)
- Run: `npm run lint`
- Type checking: `npm run type-check` (TypeScript strict mode)
- Strict mode enabled: `strict: true` in `tsconfig.json`

**Indentation & Spacing:**
- Spaces (inferred from Next.js defaults, not explicitly configured)
- Multi-line statements indented 2 spaces
- Import statements at file top in groups

## Import Organization

**Order:**
1. External framework imports (React, Next.js, Next.js specific modules like `next-auth`, `next/server`)
2. Third-party package imports (zod, bcrypt, discord.js, axios, etc.)
3. Absolute path imports using `@/` alias
4. Relative imports (rare; prefer absolute paths)

**Examples from codebase:**
```typescript
// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import crypto from 'crypto';
import { User } from '@/types/user';
import * as userStorage from '@/lib/user-storage';
```

```typescript
// src/components/about/AboutHero.tsx
import React from 'react';
import Image from 'next/image';
import { cdn } from '@/lib/cdn';
import { motion } from 'framer-motion';
import { MobiGlasPanel, MobiGlasButton, StatusIndicator } from '@/components/ui/mobiglas';
```

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` for absolute imports within the codebase

**Namespace imports:**
- Preferred for module-like imports: `import * as userStorage from '@/lib/user-storage'`
- Preferred for named exports from utilities

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations in API routes and storage layer
- Errors logged with contextual information using `logError()` or `console.error()`
- API routes return `NextResponse.json()` with error field and appropriate HTTP status codes
- Error messages logged to console include prefixes for debugging (e.g., `AUTH:`, `STORAGE:`, `LOCAL_STORAGE:`)
- Fallback patterns used when primary operation fails (e.g., MongoDB → local JSON fallback)

**Error Handling Examples:**

```typescript
// API route pattern (src/app/api/contact/route.ts)
try {
  const body = await request.json();
  const result = contactFormSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.errors },
      { status: 400 }
    );
  }
  // ... rest of logic
} catch (error) {
  logError('Contact form API error', error as Error, { duration });
  return NextResponse.json(
    { error: 'An unexpected error occurred. Please try again.' },
    { status: 500 }
  );
}
```

```typescript
// Storage layer fallback pattern (src/lib/user-storage.ts)
try {
  return await mongoDb.getUserById(id);
} catch (error) {
  console.error('STORAGE: [MongoDB] getUserById failed, trying fallback:', error);
  usingFallback = true;
  return await localStorage.getUserById(id);
}
```

```typescript
// Hook error handling (src/hooks/useUserProfile.ts)
try {
  const parsedProfile = JSON.parse(savedProfile);
  setProfile(parsedProfile);
} catch (e) {
  console.error('Failed to parse profile data:', e);
  setProfile({ ...DEFAULT_PROFILE });
}
```

- Validation errors return 400 status with field-level error details
- Server errors return 500 status with generic user-facing message
- Database/connection errors trigger fallback to local storage (hybrid system)
- Client-side errors in React components caught with `ErrorBoundary` component

## Logging

**Framework:** Built-in `console` object with structured logging class in `src/lib/logger.ts`

**Patterns:**
- Centralized logger instance: `Logger` class exported as singleton `logger`
- Convenience functions: `logDebug()`, `logInfo()`, `logWarn()`, `logError()`
- Structured JSON output in production, human-readable in development
- Module-prefixed console.log for quick debugging (e.g., `console.log('AUTH: ...', value)`)

**Logger API:**
```typescript
// From src/lib/logger.ts
logger.debug(message, context?)  // Development only
logger.info(message, context?)
logger.warn(message, context?)
logger.error(message, error?, context?)
logger.apiLog(method, path, statusCode, duration?, userId?, error?)
```

**Usage Examples:**
```typescript
// Storage operations log with [Local] or [MongoDB] prefixes
console.log(`STORAGE: [MongoDB] Getting user by ID: ${id}`);
console.log(`STORAGE: [Local] Getting user by email: ${email}`);

// Auth operations log with AUTH prefix
console.error('AUTH: User missing passwordHash:', user.aydoHandle);
console.error('AUTH: Authentication error:', error);

// API route logging
logInfo('Contact form submission successful', { name, email, duration });
logError('Contact form API error', error, { duration });
```

- Sensitive data masked in logs (passwords, tokens)
- API route logging includes method, path, status code, duration
- Error logging includes stack trace and error context

## Comments

**When to Comment:**
- Technical decisions that deviate from standard patterns (e.g., `// SECURITY FIX: Hardcoded admin user removed`)
- Complex business logic requiring explanation
- Workarounds or temporary solutions
- Integration points or non-obvious dependencies
- Comments explaining WHY, not WHAT (code should be self-documenting)

**JSDoc/TSDoc:**
- Primarily used in utility and library functions
- Not systematically applied across entire codebase
- Interface documentation found in type definition comments

**Examples:**
```typescript
// SECURITY FIX: Hardcoded admin user removed for production security
// Admin users must be created in the database with secure, unique passwords

// Parallax effect based on scroll position
const parallaxOffset = (depth: number) => {
  return scrollPosition * depth;
};

/**
 * Log an error to the error store
 */
export function logError(error: Error | unknown, type: string = 'unknown'): void { ... }
```

## Function Design

**Size:**
- API route handlers: 50-150 lines (include validation, logging, error handling)
- Helper functions: 10-50 lines
- Complex logic broken into smaller functions for reusability

**Parameters:**
- Prefer interfaces/objects over multiple primitive parameters
- Destructure props in React components: `function Component({ prop1, prop2 }: Props)`
- Optional parameters at end with sensible defaults

**Return Values:**
- Explicit type annotations required (TypeScript strict mode)
- Async functions return `Promise<Type>`
- NULL returns avoided when possible; fallback to defaults or empty collections
- API handlers return `NextResponse.json()` consistently

```typescript
// Parameter example with destructuring
async function getUserById(id: string): Promise<User | null> { ... }

// React component pattern
export default function AboutHero({ time, scrollPosition, onInitializeDataFeed }: AboutHeroProps) { ... }

// Storage API pattern
export async function createUser(user: User): Promise<User> { ... }
```

## Module Design

**Exports:**
- Named exports for multiple items: `export function getSomething()`, `export interface Something {}`
- Default exports for single main export (components, pages)
- Barrel files not used extensively

**Examples:**
```typescript
// src/app/api/auth/auth.ts - default export
export default authOptions;

// src/lib/logger.ts - mixed exports
export class Logger { ... }
export const logger = new Logger();
export const logDebug = (...) => logger.debug(...);
export const logInfo = (...) => logger.info(...);

// src/lib/user-storage.ts - named exports only
export async function getUserById(id: string): Promise<User | null> { ... }
export async function createUser(user: User): Promise<User> { ... }
```

**Barrel Files:**
- Not heavily used in codebase
- Component groups sometimes use index files for cleaner imports
- Prefer direct relative paths: `import { useUserProfile } from '@/hooks/useUserProfile'`

## Type Safety

**TypeScript Configuration:**
- Strict mode enabled: `strict: true`
- `noEmit: true` for type checking without emission
- `isolatedModules: true` for isolated module transpilation
- Target: ES2017
- Module resolution: node

**Practices:**
- Explicit return type annotations required
- Interface-based design for props and API responses
- Type aliases for discriminated unions (BuilderMissionType, BuilderMissionStatus)
- Null/undefined handling with `| null` and optional chaining `?.`

---

*Convention analysis: 2026-02-03*
