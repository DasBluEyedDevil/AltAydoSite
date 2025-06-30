import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/auth';
import { discordService } from '@/lib/discord';
import { mapDiscordEventsToEventData } from '@/lib/eventMapper';
import * as userStorage from '@/lib/user-storage';

export async function GET(request: NextRequest) {
  try {
    // Get user's timezone preference
    let userTimezone = 'UTC'; // Default to UTC
    
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const user = await userStorage.getUserById(session.user.id);
        if (user?.timezone) {
          userTimezone = user.timezone;
          console.log(`Discord API: Using user timezone: ${userTimezone} for user ${session.user.id}`);
        } else {
          console.log(`Discord API: No timezone set for user ${session.user.id}, using UTC`);
        }
      } else {
        console.log('Discord API: No user session found, using UTC timezone');
      }
    } catch (error) {
      console.warn('Could not fetch user timezone, using UTC:', error);
    }

    // Check if Discord service is configured
    if (!discordService.isConfigured()) {
      return NextResponse.json(
        { 
          error: 'Discord integration not configured. Please set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID environment variables.',
          events: [],
          userTimezone
        },
        { status: 200 } // Return 200 to allow fallback to hardcoded events
      );
    }

    // Fetch events from Discord
    const discordEvents = await discordService.getScheduledEvents();
    
    // Map Discord events to internal format with user's timezone
    const events = mapDiscordEventsToEventData(discordEvents, userTimezone);
    
    // Sort events by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return NextResponse.json({
      events,
      source: 'discord',
      count: events.length,
      lastSync: new Date().toISOString(),
      userTimezone
    });

  } catch (error) {
    console.error('Error fetching Discord events:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch Discord events',
        events: []
      },
      { status: 200 } // Return 200 to allow fallback
    );
  }
}

// Optional: POST endpoint to manually trigger event sync
export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();
    
    if (!discordService.isConfigured()) {
      return NextResponse.json(
        { error: 'Discord integration not configured' },
        { status: 400 }
      );
    }

    if (eventId) {
      // Fetch specific event
      const discordEvent = await discordService.getScheduledEvent(eventId);
      if (!discordEvent) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        event: discordEvent,
        source: 'discord'
      });
    } else {
      // Get user's timezone preference for manual sync
      let userTimezone = 'UTC';
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
          const user = await userStorage.getUserById(session.user.id);
          if (user?.timezone) {
            userTimezone = user.timezone;
          }
        }
      } catch (error) {
        console.warn('Could not fetch user timezone for manual sync, using UTC:', error);
      }
      
      // Trigger full sync
      const discordEvents = await discordService.getScheduledEvents();
      const events = mapDiscordEventsToEventData(discordEvents, userTimezone);
      
      return NextResponse.json({
        events,
        source: 'discord',
        count: events.length,
        lastSync: new Date().toISOString(),
        userTimezone
      });
    }

  } catch (error) {
    console.error('Error in Discord events POST:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process request'
      },
      { status: 500 }
    );
  }
} 