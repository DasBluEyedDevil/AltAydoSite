import { NextRequest, NextResponse } from 'next/server';
import { discordService } from '@/lib/discord';
import { mapDiscordEventsToEventData } from '@/lib/eventMapper';

export async function GET(request: NextRequest) {
  try {
    // Check if Discord service is configured
    if (!discordService.isConfigured()) {
      return NextResponse.json(
        { 
          error: 'Discord integration not configured. Please set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID environment variables.',
          events: []
        },
        { status: 200 } // Return 200 to allow fallback to hardcoded events
      );
    }

    // Fetch events from Discord
    const discordEvents = await discordService.getScheduledEvents();
    
    // Map Discord events to internal format
    const events = mapDiscordEventsToEventData(discordEvents);
    
    // Sort events by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return NextResponse.json({
      events,
      source: 'discord',
      count: events.length,
      lastSync: new Date().toISOString()
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
      // Trigger full sync
      const discordEvents = await discordService.getScheduledEvents();
      const events = mapDiscordEventsToEventData(discordEvents);
      
      return NextResponse.json({
        events,
        source: 'discord',
        count: events.length,
        lastSync: new Date().toISOString()
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