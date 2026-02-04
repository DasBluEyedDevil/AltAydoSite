# Technology Stack

**Analysis Date:** 2026-02-03

## Languages

**Primary:**
- TypeScript 5.8.3 - Full codebase with strict mode enabled
- JavaScript - Node.js scripts and utilities

**Secondary:**
- JSX/TSX - React components throughout `/src/components`

## Runtime

**Environment:**
- Node.js 18-22 (locked via `engines` in package.json)

**Package Manager:**
- npm (uses package-lock.json for lockfile)

## Frameworks

**Core:**
- Next.js 15.3.3 - Full-stack React framework with App Router
- React 18 - UI component library
- React DOM 18 - DOM rendering

**Authentication:**
- NextAuth.js 4.24.11 - Authentication and session management
  - Discord OAuth provider integration
  - Credentials provider for username/password auth
  - JWT-based session tokens with 1-hour expiry

**UI & Animation:**
- Tailwind CSS 3.3.0 - Utility-first CSS framework
- Framer Motion 10.16.4 - React animation library
- Headless UI 1.7.18 - Unstyled accessible components
- Heroicons React 2.1.1 - Icon library

**Database:**
- MongoDB 6.16.0 - MongoDB driver for Node.js
- Azure Cosmos DB (via MongoDB API) - Primary production database

**API & Integration:**
- Discord.js 14.22.1 - Discord bot and API interactions
- Nodemailer 7.0.10 - Email sending service
- Axios 1.6.7 - HTTP client library

**Build & Dev:**
- ESBuild 0.25.4 - Build tool for scripts and optimization

## Key Dependencies

**Critical Infrastructure:**
- `@azure/cosmos` 4.4.1 - Azure Cosmos DB SDK
- `@azure/identity` 4.10.0 - Azure authentication
- `@azure/msal-node` 3.5.3 - Microsoft Entra ID (Azure AD) authentication
- `mongodb` 6.16.0 - MongoDB and Cosmos DB driver
- `discord.js` 14.22.1 - Discord bot client and API
- `next-auth` 4.24.11 - Authentication framework

**Security & Cryptography:**
- `bcrypt` 5.1.1 - Password hashing (primary)
- `bcryptjs` 3.0.2 - JavaScript bcrypt alternative
- `azure-ad-verify-token` 3.0.3 - Azure AD token verification
- `openid-client` 6.5.0 - OpenID Connect client

**Utilities:**
- `zod` 3.24.4 - Schema validation and type inference
- `framer-motion` 10.16.4 - Animation and motion
- `mammoth` 1.9.0 - Word document parsing

**WebSocket/Performance:**
- `bufferutil` 4.0.9 - Buffer optimization for WebSockets
- `utf-8-validate` 6.0.5 - Fast UTF-8 validation
- `zlib-sync` 0.1.10 - Synchronous zlib compression

**Development Dependencies:**
- TypeScript 5.8.3 - Type checking
- ESLint 8.57.0 - Code linting
- Autoprefixer 10.0.1 - CSS vendor prefixing
- PostCSS 8 - CSS transformation
- tsx 4.19.4 - TypeScript script executor
- fs-extra 11.3.0 - Enhanced file system utilities

## Configuration

**TypeScript:**
- `tsconfig.json` - Strict mode enabled, target ES2017
- Path alias: `@/*` maps to `./src/*`
- Incremental compilation enabled for faster rebuilds

**Next.js:**
- `next.config.js` at `/scripts/next.config.js`
  - Output: `standalone` in production, undefined in development
  - Images: Unoptimized, remote patterns for aydocorp.space domains
  - Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
  - Cache control: 1 hour for static assets
  - Webpack: Custom configuration for discord.js dependencies
  - Redirects: Legacy /dashboard/operations/traderoutes to /dashboard/operations

**ESLint:**
- `.eslintrc.json` - Extends "next/core-web-api"
- Configured with TypeScript support via tsconfig.json

**Environment:**
- `.env.example` - Basic example with MongoDB URI
- `.env.local.example` - Complete configuration example with all services
- Uses `dotenv` 16.5.0 for loading environment variables

## Build & Deployment

**Build Process:**
```bash
npm run build          # Build production bundle with Next.js
npm run dev           # Development server on port 3000
npm start             # Production server
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
```

**Output:**
- Standalone Next.js application for Azure deployment
- Optimized for containerized environments
- TypeScript and ESLint errors prevent production builds (strict mode)

**Database Scripts:**
- Migration scripts for user data and timezone information
- Connection testing utilities for MongoDB and Cosmos DB
- Index verification for database optimization

## Platform Requirements

**Development:**
- Node.js 18-22
- npm 8+ (matches Node.js)
- TypeScript compiler
- Modern browser (ES2017 support)

**Production:**
- Azure App Service (recommended) or Node.js 18-22 hosting
- Azure Cosmos DB (MongoDB API) or MongoDB instance
- SMTP server for email services
- Discord bot token for integration features

---

*Stack analysis: 2026-02-03*
