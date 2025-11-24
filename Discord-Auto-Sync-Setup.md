# Discord Automatic User Sync Setup

This system automatically keeps website user profiles synchronized with Discord server roles in the background, without requiring manual intervention.

## How It Works

The Discord Auto-Sync system:
1. **Runs periodically** (recommended: every 6 hours)
2. **Fetches all website users** from the database
3. **Matches users with Discord server members** by Discord ID, username, or stored Discord name
4. **Updates user profiles** with current division and position based on Discord roles
5. **Logs results** for monitoring

## Setup Methods

### Option 1: External Cron Service (Recommended for Production)

Use an external cron service like:
- **Vercel Cron** (if deployed on Vercel)
- **GitHub Actions** with scheduled workflows
- **cron-job.org** or similar services
- **Server-side cron** if self-hosting

**Endpoint**: `GET https://yourdomain.com/api/cron/discord-sync`

**Example GitHub Actions workflow** (`.github/workflows/discord-sync.yml`):
```yaml
name: Discord User Sync
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Discord Sync
        run: |
{% raw %}
          curl -X GET "${{ secrets.SITE_URL }}/api/cron/discord-sync" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
{% endraw %}
```

**Example using cron-job.org**:
- URL: `https://yourdomain.com/api/cron/discord-sync`
- Method: GET
- Schedule: Every 6 hours
- Add header: `Authorization: Bearer your-cron-secret` (if using CRON_SECRET)

### Option 2: Vercel Cron (Vercel Deployments)

Add to your `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/discord-sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Option 3: Manual Testing

For testing, you can manually trigger the sync:
```bash
# Local development
curl http://localhost:3000/api/cron/discord-sync

# Production (with auth)
curl -H "Authorization: Bearer your-cron-secret" https://yourdomain.com/api/cron/discord-sync
```

## Environment Variables

Add to your `.env.local`:
```env
# Required for Discord sync
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_GUILD_ID=your-discord-server-id

# Optional: Secure your cron endpoint
CRON_SECRET=your-secure-random-string
```

## Security

### Cron Secret (Recommended)
Set `CRON_SECRET` to prevent unauthorized access to the sync endpoint:
```env
CRON_SECRET=your-very-secure-random-string-here
```

When set, all requests must include:
```
Authorization: Bearer your-very-secure-random-string-here
```

### Rate Limiting
The sync endpoint is designed to be called periodically (not frequently):
- **Recommended frequency**: Every 6 hours
- **Minimum frequency**: Every 1 hour
- **Maximum frequency**: Once per day

## Monitoring

### Success Response
```json
{
  "success": true,
  "message": "Discord user sync completed",
  "result": {
    "totalUsers": 45,
    "matchedUsers": 38,
    "updatedUsers": 12,
    "errorCount": 0,
    "hasErrors": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Discord bot token not configured",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Server Logs
The sync process logs detailed information:
```
🔄 Automated Discord user sync started
Fetching all website users...
Found 45 website users
Fetching Discord guild members...
Total Discord members fetched: 156
Found 38 matches out of 45 users
Updated user JohnDoe: division: AydoExpress, position: Ship Captain
✅ Automated Discord sync completed: totalUsers=45, matchedUsers=38, updatedUsers=12
```

## User Matching Logic

The system matches website users with Discord members using:

1. **Discord ID** (most reliable) - stored from OAuth login
2. **Discord Name** (username#discriminator) - stored in user profile
3. **Username Match** - AydoCorp handle matches Discord username
4. **Nickname Match** - AydoCorp handle matches Discord server nickname

## Role Mapping

Based on Discord server roles, the system updates:
- **Division**: AydoExpress, Empyrion Industries, Midnight Security
- **Position**: CEO, Director, Manager, Ship Captain, Pilot, Marine, Engineer, etc.

See `Discord-OAuth-Setup.md` for complete role mapping details.

## Troubleshooting

### Common Issues

**"Discord bot token not configured"**
- Ensure `DISCORD_BOT_TOKEN` is set in environment variables
- Verify the bot token is valid and active

**"Discord guild ID not configured"**
- Ensure `DISCORD_GUILD_ID` is set in environment variables
- Verify the guild ID is correct for your Discord server

**"Failed to fetch guild members"**
- Check bot permissions in Discord server
- Ensure bot has "View Server Members" permission
- Verify bot is still in the server

**Low match rates**
- Users need Discord info in their profiles (from OAuth login or manual entry)
- Check that Discord usernames match AydoCorp handles
- Verify users are actually in the Discord server

### Monitoring Setup

Set up monitoring for the sync endpoint:
- **Uptime monitoring** to ensure the endpoint is accessible
- **Log monitoring** for sync results and errors
- **Alert on failures** when `success: false`

## Manual Sync (Admin Only)

Admins can still trigger manual syncs if needed:
```bash
# Sync all users
curl -X GET "https://yourdomain.com/api/admin/discord-sync" \
  -H "Cookie: your-admin-session-cookie"

# Sync specific user
curl -X GET "https://yourdomain.com/api/admin/discord-sync?userId=user-id-here" \
  -H "Cookie: your-admin-session-cookie"
```

## Best Practices

1. **Set up monitoring** to track sync success/failure
2. **Use external cron service** for reliability
3. **Set CRON_SECRET** for security
4. **Monitor logs** for matching accuracy
5. **Test manually** before setting up automation
6. **Run sync after major Discord role changes** if needed

The automated sync ensures your website always reflects current Discord server structure without manual maintenance!
