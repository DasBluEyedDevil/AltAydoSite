# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AydoCorp website built with Next.js 15.3.3, featuring authentication, fleet operations management, mission planning, and Discord integration. The application uses a hybrid storage system with Azure Cosmos DB as primary storage and local JSON fallback.

## Commands

### Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production version
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Remove .next build directory

### Database Operations
- `npm run migrate-users` - Migrate users from local storage to Azure Cosmos DB
- `npm run migrate-timezone` - Migrate timezone data
- `npm run test-cosmos` - Test Azure Cosmos DB connection
- `npm run test-mongo` - Test MongoDB connection
- `npm run verify-cosmos` - Verify Cosmos DB setup

### Utilities
- `npm run kill-port` - Kill process on specified port (use `npm run kill-port port#`)
- `npm run gen-password` - Generate secure password
- `npm run verify-email` - Verify email configuration
- `npm run start-discord-monitor` - Start Discord role monitoring
- `npm run assign-synced-role` - Assign Discord synced roles

## Architecture

### Storage System
The application uses a hybrid storage approach:
- **Primary**: Azure Cosmos DB / MongoDB for cloud storage
- **Fallback**: Local JSON files in `/data` directory
- The system automatically falls back to local storage if cloud database is unavailable
- Check storage status via `/api/storage-status` endpoint

### Authentication
- NextAuth.js with Microsoft Entra ID (Azure AD) integration
- Traditional username/password authentication via Azure Cosmos DB
- User roles and clearance levels for access control
- Discord OAuth integration for role synchronization

### Key Components
- **Fleet Operations**: Mission planning, operations management, resource allocation
- **Mission Builder**: Complex state management for mission composition using React state
- **Discord Integration**: Role monitoring, user synchronization, event management
- **User Management**: Profile management, timezone handling, clearance-based access

### Database Collections/Storage
- Users (with clearance levels, roles, Discord integration)
- Missions and Operations
- Fleet resources and allocations
- Escort requests
- Financial transactions
- Discord events and role mappings

### File Structure
- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components organized by feature area
- `/src/lib` - Core libraries (auth, storage, Discord, etc.)
- `/src/types` - TypeScript type definitions
- `/src/hooks` - Custom React hooks
- `/src/scripts` - Administrative and migration scripts
- `/data` - Local fallback storage (JSON files)

### Configuration
- TypeScript with path aliases (`@/*` maps to `./src/*`)
- Tailwind CSS for styling
- Images unoptimized for static export
- Standalone output for deployment
- Custom webpack config for Discord.js dependencies

### Discord Integration
The application includes comprehensive Discord integration:
- Role monitoring and synchronization
- Event fetching and display
- User role mapping to clearance levels
- OAuth authentication flow
- Automatic role assignment based on website permissions

### Security
- Clearance-based access control (levels 1-5)
- Role-based permissions
- Rate limiting on sensitive endpoints
- CORS and security headers configured
- NextAuth session management

## Important Notes

- Environment variables are crucial - copy from `.env.example` to `.env.local`
- The build process ignores TypeScript and ESLint errors (configured in next.config.js)
- Discord.js dependencies require special webpack configuration
- Some API routes have rate limiting enabled
- Mission builder uses complex React state management - understand the state flow before modifying
- Always test both cloud and fallback storage modes when making storage-related changes
- Utilize MobiGlas UI components when creating new pages/components

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
  gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results