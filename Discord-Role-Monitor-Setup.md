# Discord Role Monitor Setup

The Discord Role Monitor automatically synchronizes user roles from Discord with the AydoCorp user database every 10 minutes. It maps Discord roles to organizational divisions, pay grades, positions, and clearance levels.

## Features

- **Automatic Synchronization**: Checks user roles every 10 minutes
- **Role Mapping**: Maps Discord roles to:
  - Division (AydoCorp HQ, AydoExpress, Empyrion Industries, Midnight Security)
  - Pay Grade (Executive, Director, Manager, Supervisor, Senior Employee, Employee, Intern, Freelancer, Prospective Hire)
  - Position (specific roles within each division)
  - Clearance Level (1-5 based on position)
- **Database Updates**: Automatically updates user records with current role information
- **Manual Triggers**: API endpoints for manual role checks and monitor control
- **Error Handling**: Graceful error handling with detailed logging

## Setup Instructions

### 1. Discord Bot Configuration

The Discord Role Monitor uses the same bot as the Discord Events integration. If you've already set up Discord Events, skip to step 3.

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create or select your existing application
3. Go to the "Bot" section
4. Ensure the bot has these permissions:
   - **View Channels**
   - **Read Message History** (optional)
   - **View Server Members** (required for role monitoring)

### 2. Bot Intents

The role monitor requires additional intents:

1. In the Discord Developer Portal, go to your bot settings
2. Under "Privileged Gateway Intents", enable:
   - **Server Members Intent** (required for accessing member roles)

### 3. Invite Bot to Server

1. In the Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Under "Scopes", select "bot"
3. Under "Bot Permissions", select:
   - "View Channels"
   - "Read Message History"
   - "View Server Members"
4. Copy the generated URL and invite the bot to your server

### 4. Environment Variables

Add these variables to your `.env.local` file:

```env
# Discord Integration Configuration (shared with Events)
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_GUILD_ID=your-discord-server-id-here

# Discord Role Monitor Configuration
DISCORD_ROLE_MONITOR_ENABLED=true

# Optional: Initialization secret for API security
INIT_SECRET=your-random-secret-here
```

### 5. Discord Role Setup

The system is configured to use your **existing Discord roles** based on the Role List you provided. You don't need to create new roles - just use the role names exactly as they appear in your Discord server:

#### Pay Grade Roles (standalone)
- Executive
- Manager  
- Supervisor
- Senior Employee
- Employee
- Intern
- Freelancer
- Prospective Hire

#### Division Roles (optional - can be inferred from position)
- AydoCorp HQ
- AydoExpress
- Empyrion Industries
- Midnight Security

#### Position Roles (with clearance levels - use exact names from your Discord)

**AydoCorp HQ:**
- Chief Executive Officer (CEO) - Clearance 5
- Chief Operations Officer (COO) - Clearance 5
- Chief Technology Officer (CTO) - Clearance 5
- Chief Marketing Officer (CMO) - Clearance 5
- Chief Safety Officer (CSO) - Clearance 5

**Empyrion Industries:**
- Director - Clearance 4
- Ship Captain - Clearance 3
- Crew - Clearance 2
- Seasonal Hire - Clearance 1

**AydoExpress:**
- Sub-Director - Clearance 4
- Supervisor - Clearance 3
- Loadmaster - Clearance 3
- Senior Service Agent - Clearance 2
- Service Agent - Clearance 2
- Associate - Clearance 1
- Trainee - Clearance 1

**Midnight Security:**
- Assistant Director - Clearance 4
- Head Pilot - Clearance 3
- Flight Lead - Clearance 3
- Element Lead - Clearance 3
- Seasoned Pilot - Clearance 2
- Pilot - Clearance 2
- Squad Lead - Clearance 3
- Team Lead - Clearance 3
- Veteran Marine - Clearance 2
- Seasoned Marine - Clearance 2
- Experienced Marine - Clearance 2
- Marine - Clearance 1
- Marine Trainee - Clearance 1
- Engineering Manager - Clearance 3
- Engineering Lead - Clearance 3
- Veteran Engineer - Clearance 2
- Seasoned Engineer - Clearance 2
- Experienced Engineer - Clearance 2
- Engineer - Clearance 1
- Engineer Trainee - Clearance 1
- Gunnery Manager - Clearance 3
- Gunnery Lead - Clearance 3
- Veteran Gunner - Clearance 2
- Seasoned Gunner - Clearance 2
- Experienced Gunner - Clearance 2
- Gunner - Clearance 1
- Gunnery Trainee - Clearance 1

**Note:** The system automatically determines which division a person belongs to based on their position role. You don't need to assign separate division roles unless you want to override the automatic detection.

## API Endpoints

### GET /api/discord/roles
Get the current status of the role monitor.

**Response:**
```json
{
  "status": "running",
  "nextCheck": "2024-01-15T19:10:00.000Z",
  "message": "Discord role monitoring is active"
}
```

### POST /api/discord/roles
Control the role monitor or trigger manual checks.

**Request Body:**
```json
{
  "action": "start|stop|check"
}
```

**Actions:**
- `start`: Start the automatic role monitoring
- `stop`: Stop the automatic role monitoring
- `check`: Trigger a manual role check for all users

### POST /api/discord/roles/user
Check roles for a specific user.

**Request Body:**
```json
{
  "userId": "user-id-here"
}
```
or
```json
{
  "discordName": "username"
}
```

## Starting the Monitor

### Automatic Startup
The monitor will start automatically when:
- `NODE_ENV=production` OR
- `DISCORD_ROLE_MONITOR_ENABLED=true`

### Manual Startup
You can manually start/stop the monitor using the API endpoints above.

## User Setup

For users to have their roles synchronized:

1. Users must have a `discordName` field in their user profile
2. The `discordName` should match their Discord username, display name, or tag
3. Users need to be members of the Discord server with the appropriate roles

## Customizing Role Mappings

To modify role mappings, edit `src/lib/discord-role-mappings.ts`:

1. Update the `ROLE_MAPPINGS` array to match your Discord role names
2. Modify `POSITIONS_WITH_CLEARANCE` for position-specific clearance levels
3. Adjust `PAY_GRADES` and `DIVISIONS` as needed

## Troubleshooting

### Monitor Not Starting
1. Check environment variables are set correctly
2. Verify `DISCORD_ROLE_MONITOR_ENABLED=true` or running in production
3. Check server logs for initialization errors

### Users Not Being Updated
1. Verify users have `discordName` set in their profiles
2. Check that Discord role names match the configuration exactly
3. Ensure the bot has "Server Members Intent" enabled
4. Check the bot is in your Discord server

### Permission Errors
1. Verify the bot has "View Server Members" permission
2. Check that "Server Members Intent" is enabled in Discord Developer Portal
3. Ensure the bot token is correct

### Role Mapping Issues
1. Check Discord role names match exactly (case-sensitive)
2. Verify role mappings in `discord-role-mappings.ts`
3. Test with manual role check API endpoint

## Security Notes

- **Bot Token**: Never commit your bot token to version control
- **API Security**: The role monitoring APIs require authentication and appropriate clearance levels
- **Member Intent**: The Server Members Intent is required but considered privileged - use responsibly
- **Rate Limits**: The system respects Discord API rate limits and includes error handling

## Monitoring and Logs

The system provides detailed logging for:
- Monitor startup/shutdown
- Role check cycles
- User updates
- Errors and warnings

Check your server logs to monitor the system's operation.
