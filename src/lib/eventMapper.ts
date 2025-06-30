import { DiscordScheduledEvent } from '@/types/DiscordEvent';

// Import existing EventData interface and enum
export enum EventType {
  General = 'general',
  AydoExpress = 'express',
  EmpyrionIndustries = 'empyrion',
  MidnightSecurity = 'security'
}

export interface EventData {
  id: number;
  title: string;
  date: Date;
  time: string;
  type: EventType;
  description: string;
}

/**
 * Map Discord event to internal EventData format
 */
export function mapDiscordEventToEventData(discordEvent: DiscordScheduledEvent): EventData {
  // Parse the scheduled start time
  const startDate = new Date(discordEvent.scheduled_start_time);
  
  // Determine event type based on name or description keywords
  const eventType = determineEventType(discordEvent.name, discordEvent.description || '');
  
  // Format time string
  const timeString = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short'
  });

  return {
    id: parseInt(discordEvent.id, 36), // Convert Discord snowflake to number (may need adjustment)
    title: discordEvent.name,
    date: startDate,
    time: timeString,
    type: eventType,
    description: discordEvent.description || 'Discord scheduled event'
  };
}

/**
 * Determine event type based on keywords in title and description
 */
function determineEventType(title: string, description: string): EventType {
  const text = (title + ' ' + description).toLowerCase();
  
  // Check for Midnight Security keywords
  if (text.includes('security') || 
      text.includes('escort') || 
      text.includes('protection') || 
      text.includes('midnight') ||
      text.includes('patrol') ||
      text.includes('combat') ||
      text.includes('pvp') ||
      text.includes('bounty') ||
      text.includes('defense') ||
      text.includes('tactical')) {
    return EventType.MidnightSecurity;
  }
  
  // Check for AydoExpress keywords
  if (text.includes('cargo') || 
      text.includes('hauling') || 
      text.includes('transport') || 
      text.includes('aydoexpress') || 
      text.includes('aydo express') ||
      text.includes('delivery') ||
      text.includes('logistics')) {
    return EventType.AydoExpress;
  }
  
  // Check for Empyrion Industries keywords
  if (text.includes('mining') || 
      text.includes('empyrion') || 
      text.includes('industries') ||
      text.includes('extraction') ||
      text.includes('ore') ||
      text.includes('asteroid') ||
      text.includes('refinery')) {
    return EventType.EmpyrionIndustries;
  }
  
  // Default to general events
  return EventType.General;
}

/**
 * Map multiple Discord events to EventData array
 */
export function mapDiscordEventsToEventData(discordEvents: DiscordScheduledEvent[]): EventData[] {
  return discordEvents.map(mapDiscordEventToEventData);
}

/**
 * Format Discord event time for display
 */
export function formatEventTime(discordEvent: DiscordScheduledEvent): string {
  const startDate = new Date(discordEvent.scheduled_start_time);
  const endDate = discordEvent.scheduled_end_time ? new Date(discordEvent.scheduled_end_time) : null;
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  };
  
  const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
  
  if (endDate) {
    const endTime = endDate.toLocaleTimeString('en-US', timeOptions);
    return `${startTime} - ${endTime} UTC`;
  }
  
  return `${startTime} UTC`;
} 