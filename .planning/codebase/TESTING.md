# Testing Patterns

**Analysis Date:** 2026-02-03

## Test Framework

**Status:** Not detected - No testing framework configured

**Current State:**
- No Jest, Vitest, or other test runner found in `package.json`
- No `jest.config.js`, `vitest.config.js`, or test configuration files in root
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files found in codebase
- No testing scripts in `package.json` (only lint, type-check, build, dev scripts)

**Runner:**
- None configured
- Suggested: Jest or Vitest for Next.js 15 applications

**Assertion Library:**
- None - would need to be added (e.g., Jest assertions or Vitest with Chai)

**Run Commands (Currently Not Available):**
```bash
# Would need to be added:
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
```

## Test File Organization

**Current Pattern:**
- No test files exist in codebase
- Directory structure does not include `__tests__` or `tests` folder
- No co-located test files next to source

**Recommended Location (if implemented):**
- Co-locate tests with source: `src/lib/user-storage.ts` → `src/lib/user-storage.test.ts`
- Or separate directory: `src/__tests__/lib/user-storage.test.ts`

**Naming Convention (to follow):**
- Pattern: `{filename}.test.ts` or `{filename}.spec.ts`
- Example: `useUserProfile.test.ts`, `logger.test.ts`

**Recommended Structure:**
```
src/
├── __tests__/
│   ├── lib/
│   │   ├── user-storage.test.ts
│   │   ├── logger.test.ts
│   │   └── email-service.test.ts
│   ├── hooks/
│   │   └── useUserProfile.test.ts
│   ├── api/
│   │   ├── auth.test.ts
│   │   └── contact.test.ts
│   └── components/
│       └── about/AboutHero.test.tsx
```

## Test Structure

**Patterns Currently in Codebase:**
- No test files exist to extract patterns from
- Recommended structure based on Next.js conventions:

```typescript
// Recommended test file structure pattern
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// or import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Component/Function Name', () => {
  // Setup
  beforeEach(() => {
    // Initialize test data, mocks
  });

  // Teardown
  afterEach(() => {
    // Clean up, reset mocks
  });

  describe('when condition', () => {
    it('should do something specific', () => {
      // Arrange
      const input = ...;

      // Act
      const result = ...;

      // Assert
      expect(result).toBe(...);
    });

    it('should handle error case', () => {
      // Arrange
      const input = ...;

      // Act & Assert
      expect(() => fn(input)).toThrow();
    });
  });
});
```

**Patterns in Similar Codebase Areas:**
- Validation patterns exist in API routes using Zod (not tested)
- Error handling patterns exist (try-catch) but not tested
- Storage layer has fallback logic that should be tested

## Mocking

**Framework:** None configured

**Recommended Approach:**
- Vitest: Native mocking with `vi.mock()`, `vi.spyOn()`
- Jest: `jest.mock()`, `jest.spyOn()`

**Storage Mocking Pattern (Recommended for Testing):**
```typescript
// Mock example for user-storage functions
import { getUserById, createUser } from '@/lib/user-storage';
import * as localStorageMod from '@/lib/local-storage';
import * as mongoDbMod from '@/lib/mongodb-client';

vi.mock('@/lib/local-storage');
vi.mock('@/lib/mongodb-client');

describe('user-storage', () => {
  it('should return user from MongoDB', async () => {
    const mockUser = { id: '1', aydoHandle: 'test', ... };
    vi.mocked(mongoDbMod.getUserById).mockResolvedValueOnce(mockUser);

    const result = await getUserById('1');
    expect(result).toEqual(mockUser);
  });

  it('should fallback to localStorage on MongoDB failure', async () => {
    const mockUser = { id: '1', aydoHandle: 'test', ... };
    vi.mocked(mongoDbMod.getUserById).mockRejectedValueOnce(new Error('DB down'));
    vi.mocked(localStorageMod.getUserById).mockResolvedValueOnce(mockUser);

    const result = await getUserById('1');
    expect(result).toEqual(mockUser);
  });
});
```

**HTTP Mocking (API Routes):**
```typescript
// For testing API routes
import { POST } from '@/app/api/contact/route';

describe('POST /api/contact', () => {
  it('should validate required fields', async () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: '' })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

**What to Mock:**
- External dependencies (API clients, database connections, file system)
- Third-party services (Discord API, email service, storage)
- Time-dependent functions (Date, timers)
- Random number generation
- Browser APIs (localStorage, sessionStorage)

**What NOT to Mock:**
- Pure utility functions without side effects
- Type definitions and interfaces
- Business logic that's being tested
- Simple library functions (e.g., Zod validation)

## Fixtures and Factories

**Test Data Location (Not Yet Implemented):**
- Recommended: `src/__tests__/fixtures/` or `src/__tests__/factories/`

**Recommended Factory Pattern:**

```typescript
// src/__tests__/factories/user.ts
import { User } from '@/types/user';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: '123',
    aydoHandle: 'test-user',
    email: 'test@example.com',
    passwordHash: '$2b$10$...', // Would be real hash in test
    clearanceLevel: 1,
    role: 'user',
    discordName: null,
    rsiAccountName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockMission(overrides?: Partial<Mission>): Mission {
  return {
    id: '456',
    name: 'Test Mission',
    type: 'Cargo Haul',
    status: 'Planning',
    participants: [],
    ...overrides,
  };
}
```

**Usage in Tests:**
```typescript
describe('updateUser', () => {
  it('should update user properties', async () => {
    const user = createMockUser({ aydoHandle: 'old-handle' });
    const result = await updateUser(user.id, { aydoHandle: 'new-handle' });
    expect(result.aydoHandle).toBe('new-handle');
  });
});
```

## Coverage

**Requirements:** Not enforced

**Current State:**
- No coverage configuration
- No coverage thresholds
- No coverage reports generated

**Recommended Setup:**
```typescript
// vitest.config.ts (recommended)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
});
```

**View Coverage (When Implemented):**
```bash
npm run test:cov
# Open coverage/index.html in browser
```

## Test Types

**Unit Tests:**
- Scope: Individual functions, hooks, utilities
- Approach: Test function in isolation with mocked dependencies
- Examples:
  - Logger functions with different log levels
  - Validation functions (Zod schemas)
  - Storage layer operations (getUserById, createUser, etc.)
  - Utility functions (date formatting, transformations)

**Integration Tests:**
- Scope: Multiple components working together (API route + storage, for example)
- Approach: Test realistic scenarios with real implementations
- Examples:
  - API route: POST /api/auth/signup (validates, creates user, returns response)
  - API route: POST /api/contact (validates, sends email, logs)
  - Storage layer: MongoDB with fallback to localStorage
  - Authentication flow: Login with credentials or Discord OAuth

**E2E Tests:**
- Framework: Not currently used; would recommend Playwright or Cypress
- Scope: Full user workflows (signup → login → create mission, etc.)
- Example: User signs up, logs in, creates a mission, invites crew members
- Would be in separate `e2e/` directory with Playwright configuration

**Missing in Current Setup:**
- All three test types completely absent
- No test infrastructure
- No CI/CD test execution

## Common Patterns

**Async Testing (To Be Implemented):**
```typescript
describe('async operations', () => {
  // With Vitest/Jest async/await
  it('should fetch user data', async () => {
    const user = await getUserById('123');
    expect(user?.aydoHandle).toBe('test-user');
  });

  // Alternative with done callback
  it('should handle promise', (done) => {
    getUserById('123').then(user => {
      expect(user).toBeDefined();
      done();
    });
  });
});
```

**Error Testing (To Be Implemented):**
```typescript
describe('error handling', () => {
  it('should throw on invalid input', () => {
    expect(() => validateEmail('invalid')).toThrow('Invalid email');
  });

  it('should handle rejected promise', async () => {
    await expect(getUserById('nonexistent')).rejects.toThrow('Not found');
  });

  it('should catch error in try-catch', async () => {
    try {
      await someFailingOperation();
      fail('Should have thrown');
    } catch (error) {
      expect((error as Error).message).toContain('expected message');
    }
  });
});
```

**React Component Testing (To Be Implemented):**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AboutHero } from '@/components/about/AboutHero';

describe('AboutHero', () => {
  it('should call onInitializeDataFeed when button clicked', async () => {
    const mockCallback = vi.fn();
    render(
      <AboutHero
        time={new Date()}
        scrollPosition={0}
        onInitializeDataFeed={mockCallback}
      />
    );

    const button = screen.getByText(/INITIALIZE DATA FEED/i);
    await userEvent.click(button);

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should display correct status on mount', () => {
    render(
      <AboutHero
        time={new Date()}
        scrollPosition={0}
        onInitializeDataFeed={() => {}}
      />
    );

    expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument();
  });
});
```

## Critical Code Areas Without Tests

**High Priority (Business Logic):**
- `src/lib/user-storage.ts` - Hybrid MongoDB/localStorage fallback mechanism
- `src/app/api/auth/auth.ts` - Authentication provider configuration (Discord + credentials)
- `src/lib/mongodb-client.ts` - Database connection and queries
- `src/lib/discord-oauth.ts` - Discord profile synchronization

**Medium Priority (API Routes):**
- `src/app/api/auth/signup/route.ts` - User registration with validation
- `src/app/api/contact/route.ts` - Contact form with email validation
- `src/app/api/auth/forgot-password/route.ts` - Password reset flow
- `src/app/api/auth/reset-password/route.ts` - Password update

**Medium Priority (Hooks & Components):**
- `src/hooks/useUserProfile.ts` - Profile state management and persistence
- `src/components/about/AboutHero.tsx` - Complex animation and parallax logic
- Mission builder components - Complex state management

**Implementation Recommendation:**
1. Start with utility/lib tests (user-storage, logger, validators)
2. Add API route tests (signup, contact, auth)
3. Add hook tests (useUserProfile, useEvents)
4. Add component tests (critical UI components)
5. Add E2E tests for key user flows

---

*Testing analysis: 2026-02-03*
