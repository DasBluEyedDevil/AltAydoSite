# Discord OAuth Integration Setup

The AydoCorp website now supports Discord OAuth authentication, allowing users to sign in with their Discord accounts and automatically sync their Discord profile information to the database.

## Features

- **Discord OAuth Login**: Users can sign in using their Discord accounts
- **Automatic Profile Sync**: Discord username, discriminator, and avatar are automatically pulled and stored
- **Account Linking**: Existing users can link their Discord accounts to their AydoCorp accounts
- **Seamless Integration**: Works alongside existing credentials-based authentication
- **Auto-Registration**: New users signing in with Discord get automatically registered

## Setup Instructions

### 1. Create Discord OAuth Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "AydoCorp OAuth")
3. Go to the "OAuth2" section in the left sidebar
4. Under "Redirects", add your callback URLs:
   - For development: `http://localhost:3000/api/auth/callback/discord`
   - For production: `https://yourdomain.com/api/auth/callback/discord`
5. Under "OAuth2" > "General", copy your:
   - **Client ID** 
   - **Client Secret** (click "Reset Secret" if needed)

### 2. Configure OAuth Scopes

In the Discord Developer Portal, under OAuth2:
1. Select the following scopes:
   - `identify` - To get basic user information
   - `email` - To get the user's email address
   - `guilds.members.read` - To read user's guild membership and roles

### 3. Set Environment Variables

Add these variables to your `.env.local` file:

```env
# Discord OAuth Configuration (for user authentication)
DISCORD_CLIENT_ID=your-discord-oauth-client-id
DISCORD_CLIENT_SECRET=your-discord-oauth-client-secret

# Discord Bot Configuration (for events integration - if different app)
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_GUILD_ID=your-discord-server-id
```

**Important Notes:**
- The Discord OAuth app can be the same as your Discord bot app, or separate
- If using the same app, you'll have both OAuth credentials AND a bot token
- If using separate apps, you'll need two different Discord applications

### 4. Test the Integration

1. Restart your Next.js development server
2. Navigate to the login page
3. Click "SIGN IN WITH DISCORD"
4. Authorize the application in Discord
5. You should be automatically logged in and redirected

## How It Works

### Authentication Flow

1. **User clicks Discord login** → Redirects to Discord OAuth
2. **User authorizes** → Discord returns with authorization code
3. **NextAuth exchanges code** → Gets user profile from Discord API
4. **Profile processing**:
   - If user exists by Discord ID: Update profile and sign in
   - If user exists by email: Link Discord account and sign in  
   - If new user: Create account with Discord profile data
5. **Session created** → User is logged in with full profile

### Data Synchronization

When a user signs in with Discord, the following data is automatically synced:

| Discord Field | Database Field | Description |
|---------------|----------------|-------------|
| `id` | `discordId` | Discord user ID (permanent) |
| `username#discriminator` | `discordName` | Full Discord username |
| `avatar` | `discordAvatar` | Discord avatar URL |
| `email` | `email` | User's email address |
| `nickname` or `username` | `aydoHandle` | Discord display name or username |
| **Server Roles** | `division` | Parsed from role names (AydoExpress, Empyrion, etc.) |
| **Server Roles** | `position` | Parsed from role names (CEO, Director, Manager, etc.) |

### Role-Based Profile Data

The system automatically extracts division and position information from Discord server roles:

**Division Mapping:**
- Roles containing "AydoExpress", "Aydo Express" → `AydoExpress`
- Roles containing "Empyrion Industries", "Empyrion" → `Empyrion Industries`
- Roles containing "Midnight Security", "Midnight" → `Midnight Security`

**Position Mapping (by hierarchy):**
- **Executive Level**: CEO, COO, CTO, CMO, CSO
- **Director Level**: Director, Assistant Director, Sub-Director  
- **Management Level**: Manager, Supervisor, Loadmaster
- **Specialized Positions**: Ship Captain, Head Pilot, Flight Lead, Element Lead, Squad Lead, Team Lead
- **Service & Operations**: Senior Service Agent, Service Agent, Pilot, Associate, Trainee
- **Marine/Security**: Veteran Marine, Seasoned Marine, Experienced Marine, Marine, Marine Trainee
- **Engineering**: Engineering Manager/Lead, Veteran/Seasoned/Experienced Engineer, Engineer, Engineer Trainee
- **Gunnery**: Gunnery Manager/Lead, Veteran/Seasoned/Experienced Gunner, Gunner, Gunnery Trainee
- **General**: Senior Employee, Employee, Intern, Freelancer, Prospective Hire, Seasonal Hire, Crew

### Account Linking

- **Existing users**: If an email match is found, Discord info is added to existing account
- **New users**: Automatically registered with Discord profile data
- **Security**: Users maintain their existing clearance levels and roles

## API Endpoints

The Discord OAuth integration uses NextAuth's built-in endpoints:

- **Authorization**: `/api/auth/signin/discord`
- **Callback**: `/api/auth/callback/discord`
- **Session**: `/api/auth/session` (includes Discord profile data)

## User Profile Integration

Discord profile data is available in the user session:

```typescript
// In any component with useSession
const { data: session } = useSession();

if (session?.user) {
  console.log('Discord ID:', session.user.discordId);
  console.log('Discord Name:', session.user.discordName);
  console.log('Discord Avatar:', session.user.discordAvatar);
}
```

## Database Schema Updates

The User model now includes Discord-specific fields:

```typescript
interface User {
  // ... existing fields
  discordId?: string | null;      // Discord user ID
  discordName: string | null;     // Discord username#discriminator  
  discordAvatar?: string | null;  // Discord avatar URL
}
```

## Security Considerations

1. **Client Secret Protection**: Never commit Discord client secret to version control
2. **Redirect URI Validation**: Only add trusted domains to Discord OAuth redirects
3. **Scope Limitation**: Only request necessary scopes (`identify` and `email`)
4. **Account Verification**: Email verification is handled by Discord OAuth

## Troubleshooting

### OAuth Errors

**"Invalid Redirect URI"**
- Ensure redirect URI in Discord matches exactly: `http://localhost:3000/api/auth/callback/discord`
- Check for trailing slashes or typos

**"Invalid Client"**
- Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct
- Ensure environment variables are loaded (restart server)

**"Access Denied"**
- Check OAuth scopes in Discord Developer Portal
- Ensure user has authorized the application

### User Creation Issues

**"User creation failed"**
- Check database connection
- Verify User model includes new Discord fields
- Check server logs for specific error messages

**"Email already exists"**
- This is expected behavior - the system will link Discord to existing account
- User should be logged in successfully despite this message

### Profile Sync Issues

**Discord avatar not showing**
- Check if `discordAvatar` field is populated in database
- Verify Discord avatar URL is accessible
- Check if user has a Discord avatar set

**Username conflicts**
- System uses Discord username as default AydoCorp handle for new users
- If handle exists, a unique variation will be created
- Users can change their handle in profile settings

## Bot vs OAuth Apps

You can use the same Discord application for both OAuth and bot functionality:

### Same Application (Recommended)
- Create one Discord application
- Set up OAuth2 redirects and get Client ID/Secret
- Create bot and get bot token
- Use same application for both features

### Separate Applications
- Create one app for OAuth (user authentication)
- Create another app for bot (events integration)  
- Manage credentials separately

## Rate Limits

Discord OAuth has rate limits:
- **OAuth flows**: 5 requests per 5 seconds per user
- **User info requests**: Handled by NextAuth caching
- **Failed attempts**: Exponential backoff implemented

The system handles rate limits gracefully and will retry failed requests.

## Production Deployment

Before deploying to production:

1. **Update redirect URIs** in Discord Developer Portal
2. **Set production environment variables**
3. **Test OAuth flow** in production environment
4. **Monitor error logs** for any issues
5. **Update documentation** with production URLs

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a fresh Discord account
4. Check Discord Developer Portal for application status
