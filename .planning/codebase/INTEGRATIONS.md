# External Integrations

**Analysis Date:** 2026-02-03

## APIs & External Services

**Discord:**
- Discord REST API v10 - Event management, scheduled events, role management
  - SDK/Client: `discord.js` 14.22.1
  - Auth: `DISCORD_BOT_TOKEN` (environment variable)
  - Guild ID: `DISCORD_GUILD_ID` (environment variable)
  - Scopes: identify, email, guilds.members.read
  - Features:
    - Scheduled event creation/update/deletion
    - Member role fetching and assignment
    - RSVP user tracking
    - Bot gateway with Guilds and GuildMembers intents

**Microsoft Entra ID (Azure AD):**
- Azure AD OAuth 2.0 - User authentication
  - SDK/Client: `@azure/msal-node` 3.5.3, `openid-client` 6.5.0
  - Auth: `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`
  - Token verification: `azure-ad-verify-token` 3.0.3

**Email Service:**
- SMTP (generic) - Password resets and contact form emails
  - SDK/Client: `nodemailer` 7.0.10
  - Configuration: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_SECURE`
  - Recipient: `CONTACT_EMAIL` (fallback to `EMAIL_USER`)
  - Features: Password reset emails, contact form submissions

## Data Storage

**Databases:**
- Azure Cosmos DB (MongoDB API)
  - Connection: `COSMOSDB_CONNECTION_STRING` (vCore) or `MONGODB_URI`
  - Client: `mongodb` driver 6.16.0
  - Database ID: `COSMOS_DATABASE_ID`
  - Collections: users, missions, operations, resources, resource-allocations, escort-requests, missions-templates
  - Fallback: Local JSON files in `/data` directory when cloud unavailable

- Legacy MongoDB
  - Connection: `MONGODB_URI` (standard MongoDB connection string)
  - Supported for backward compatibility
  - Pool size: 100 max, 0 min
  - Timeouts: 30 seconds for connect/socket, 120 seconds idle timeout

**File Storage:**
- Local filesystem only (fallback storage)
  - Location: `/data` directory with JSON files
  - Files: missions.json, operations.json, resources.json, users.json, etc.
  - Auto-fallback when Cosmos DB unavailable

**Caching:**
- None - Application uses direct database reads

## Authentication & Identity

**Auth Providers:**
- Discord OAuth 2.0 (via NextAuth.js)
  - Client ID: `DISCORD_CLIENT_ID`
  - Client Secret: `DISCORD_CLIENT_SECRET`
  - Automatic user creation/update on first sign-in
  - Role/division/position/pay grade extraction from Discord roles
  - Implementation: `src/lib/discord-oauth.ts`

- Custom Credentials (username/password)
  - Stored in database with bcrypt-hashed passwords
  - Credentials provider via NextAuth.js
  - Implementation: `src/app/api/auth/auth.ts`

**Session Management:**
- NextAuth.js 4.24.11
  - JWT token-based sessions
  - Token max age: 1 hour
  - Session callbacks for user data enrichment
  - Implementation: `src/app/api/auth/[...nextauth]/route.ts`

**Password Security:**
- bcrypt 5.1.1 - Primary password hashing
- bcryptjs 3.0.2 - Alternative implementation

## Monitoring & Observability

**Error Tracking:**
- None detected - Console logging only

**Logs:**
- Console logging via console.log/console.error
- Database connection logging at startup
- Discord API error logging with response details
- Auth error logging with attempts

## CI/CD & Deployment

**Hosting:**
- Azure App Service (primary target)
- Standalone Next.js deployment
- Configured for containerized environments

**CI Pipeline:**
- None detected in codebase

## Environment Configuration

**Required env vars (Production):**
- `NEXTAUTH_URL` - Application URL for auth callbacks
- `NEXTAUTH_SECRET` - Encryption secret for NextAuth sessions
- `COSMOSDB_CONNECTION_STRING` or `MONGODB_URI` - Database connection
- `COSMOS_DATABASE_ID` - Database name
- `DISCORD_BOT_TOKEN` - Discord bot authentication
- `DISCORD_GUILD_ID` - Discord server ID
- `DISCORD_CLIENT_ID` - Discord OAuth app ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth app secret
- `ENTRA_TENANT_ID` - Azure AD tenant ID
- `ENTRA_CLIENT_ID` - Azure AD app ID
- `ENTRA_CLIENT_SECRET` - Azure AD app secret
- `EMAIL_HOST` - SMTP server hostname
- `EMAIL_PORT` - SMTP server port
- `EMAIL_USER` - SMTP authentication username
- `EMAIL_PASSWORD` - SMTP authentication password
- `EMAIL_SECURE` - TLS/SSL for SMTP (true/false)

**Optional env vars:**
- `COSMOS_CONTAINER_ID` - Container within database (default: "users")
- `CONTACT_EMAIL` - Where contact form emails go (fallback to EMAIL_USER)
- `NODE_ENV` - Set to "production" or "development"

**Secrets location:**
- Azure Key Vault (recommended for production)
- `.env.local` file in development (NOT committed)

## Webhooks & Callbacks

**Incoming:**
- NextAuth.js OAuth callbacks at `/api/auth/[...nextauth]`
- Contact form at `/api/contact`
- Discord sync endpoints at `/api/admin/discord-sync`, `/api/cron/discord-sync`

**Outgoing:**
- Nodemailer SMTP to configured email server
- Discord API calls for event/role management
- Azure Cosmos DB queries

## Data Flow

**Discord Integration Flow:**

1. User initiates Discord OAuth sign-in
2. Discord redirects with authorization code
3. NextAuth exchanges code for access token
4. `syncDiscordProfile()` fetches user's guild member info and roles
5. Roles parsed to extract division, position, pay grade, clearance level
6. User created/updated in Cosmos DB with Discord profile data
7. Clearance level and role cached in JWT session token

**Email Service Flow:**

1. User requests password reset via `/api/auth/forgot-password`
2. Reset token generated and stored in database
3. Password reset email sent via Nodemailer/SMTP
4. User receives email with reset link
5. User submits new password to `/api/auth/reset-password`
6. Token validated and password updated

**Database Fallback Flow:**

1. Application attempts Cosmos DB connection
2. On connection failure, local JSON storage falls back
3. All CRUD operations transparently use JSON files in `/data`
4. Storage status exposed via `/api/storage-status` endpoint

## API Rate Limiting & Security

**Configured Security Headers:**
- `X-Frame-Options: SAMEORIGIN` - Clickjacking prevention
- `X-Content-Type-Options: nosniff` - MIME type sniffing prevention
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer control

**Image Optimization:**
- Remote patterns allow: `https://images.aydocorp.space/**` and `https://aydocorp.space/images/**`
- SVG allowed with XSS mitigation enabled

**Rate Limiting:**
- None explicitly configured

---

*Integration audit: 2026-02-03*
