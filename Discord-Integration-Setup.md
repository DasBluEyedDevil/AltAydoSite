# Discord Events Integration Setup

The AydoCorp website now supports automatic synchronization of Discord scheduled events to the events calendar. This integration will automatically pull events from your Discord server and display them on the dashboard events page.

## Features

- **Automatic Sync**: Discord scheduled events are automatically fetched and displayed
- **Smart Categorization**: Events are automatically categorized based on keywords:
  - **AydoExpress**: Events containing keywords like "cargo", "hauling", "transport", "delivery", "logistics"
  - **Empyrion Industries**: Events containing keywords like "mining", "extraction", "ore", "asteroid", "refinery"
  - **General**: All other events
- **Graceful Fallback**: If Discord is unavailable, the calendar falls back to hardcoded events
- **Real-time Status**: UI shows whether events are synced from Discord or using fallback
- **Manual Refresh**: Users can manually trigger event sync

## Setup Instructions

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "AydoCorp Events Bot")
3. Go to the "Bot" section in the left sidebar
4. Click "Add Bot" if not already created
5. Under "Token", click "Copy" to copy the bot token
6. Save this token securely - you'll need it for the environment variables

### 2. Get Discord Server ID

1. Enable Developer Mode in Discord (User Settings > App Settings > Advanced > Developer Mode)
2. Right-click on your Discord server name
3. Click "Copy Server ID"
4. Save this ID - you'll need it for the environment variables

### 3. Invite Bot to Server

1. In the Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Under "Scopes", select "bot"
3. Under "Bot Permissions", select:
   - "View Channels"
   - "Read Message History" (optional)
4. Copy the generated URL and open it in your browser
5. Select your Discord server and authorize the bot

### 4. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Discord Integration Configuration
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_GUILD_ID=your-discord-server-id-here
```

### 5. Test the Integration

1. Create a scheduled event in your Discord server:
   - Server Settings > Events > Create Event
   - Or use the "+" button in the events section
2. Restart your Next.js development server
3. Navigate to the events calendar page
4. You should see a green "Discord" indicator and your Discord events

## API Endpoints

### GET /api/events/discord
Fetches all scheduled events from Discord and maps them to the internal format.

**Response:**
```json
{
  "events": [
    {
      "id": 123456,
      "title": "Weekly Mining Operation",
      "date": "2024-01-15T19:00:00.000Z",
      "time": "07:00 PM UTC",
      "type": "empyrion",
      "description": "Joint mining expedition in the asteroid belt"
    }
  ],
  "source": "discord",
  "count": 1,
  "lastSync": "2024-01-10T15:30:00.000Z"
}
```

### POST /api/events/discord
Manually trigger event sync or fetch specific event.

**Request Body:**
```json
{
  "eventId": "optional-specific-event-id"
}
```

## Event Type Mapping

The system automatically categorizes Discord events based on keywords in the event name and description:

| Category | Keywords |
|----------|----------|
| **AydoExpress** | cargo, hauling, transport, aydoexpress, aydo express, delivery, logistics |
| **Empyrion Industries** | mining, empyrion, industries, extraction, ore, asteroid, refinery |
| **General** | All other events (default) |

## Troubleshooting

### Events Not Showing Up

1. **Check Environment Variables**: Ensure `DISCORD_BOT_TOKEN` and `DISCORD_GUILD_ID` are correctly set
2. **Check Bot Permissions**: Verify the bot has been invited to your server
3. **Check Discord Events**: Make sure you have scheduled events in your Discord server
4. **Check Console**: Look for error messages in the browser console or server logs

### Bot Permission Issues

If you see authentication errors:
1. Verify the bot token is correct
2. Ensure the bot is in your Discord server
3. Check that the guild ID matches your server

### No Events From Discord

- Verify you have scheduled events in Discord
- Events must be in "Scheduled" or "Active" status
- Completed or cancelled events are filtered out

## Status Indicators

The events calendar shows the current sync status:

- 🟡 **Syncing...**: Currently fetching events from Discord
- 🟢 **Discord**: Successfully synced with Discord
- ⚫ **Local**: Using fallback events (Discord unavailable)

## Rate Limits

Discord API has rate limits. The system handles this gracefully:
- Failed requests fall back to cached/hardcoded events
- Exponential backoff is implemented in the Discord service
- Manual refresh requests are throttled to prevent abuse

## Security Notes

- **Never commit your bot token to version control**
- Store sensitive credentials in environment variables only
- The bot only needs read permissions for scheduled events
- Consider rotating the bot token periodically 