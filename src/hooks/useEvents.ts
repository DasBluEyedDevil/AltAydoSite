import { useState, useEffect, useCallback, useRef } from 'react';
import { EventData, EventType } from '@/lib/eventMapper';
import { useUserTimezone } from './useUserTimezone';

// No fallback events - only pull from Discord

interface UseEventsReturn {
  events: EventData[];
  loading: boolean;
  error: string | null;
  source: 'discord' | 'fallback';
  lastSync: string | null;
  refetch: () => Promise<void>;
  refreshWithTimezone: () => Promise<void>;
}

interface DiscordEventsResponse {
  events: EventData[];
  source?: string;
  count?: number;
  lastSync?: string;
  error?: string;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'discord' | 'fallback'>('fallback');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  
  // Get user's timezone but don't auto-refetch on changes
  const { timezone: userTimezone, loading: timezoneLoading, refetch: refetchTimezone } = useUserTimezone();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events/discord', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: DiscordEventsResponse = await response.json();

      if (data.error && data.events.length === 0) {
        // Discord integration failed, no events to show
        console.warn('Discord events unavailable:', data.error);
        setEvents([]);
        setSource('fallback');
        setError(data.error);
      } else if (data.events && data.events.length > 0) {
        // Discord events available
        // Convert date strings back to Date objects and ensure timezone formatting
        const processedEvents = data.events.map(event => {
          const eventDate = new Date(event.date);
          return {
            ...event,
            date: eventDate
          };
        });
        
        console.log('Processed events with current timezone:', userTimezone, processedEvents.length, 'events');
        
        setEvents(processedEvents);
        setSource('discord');
        setLastSync(data.lastSync || new Date().toISOString());
        setError(null);
      } else {
        // No events from Discord
        setEvents([]);
        setSource('fallback');
        setError('No Discord events found');
      }

    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      setEvents([]);
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  }, [userTimezone]);

  // Refresh both timezone and events (for when timezone changes)
  const refreshWithTimezone = useCallback(async () => {
    console.log('Refreshing timezone and events...');
    await refetchTimezone();
    // Small delay to ensure timezone is updated before fetching events
    setTimeout(() => {
      fetchEvents();
    }, 100);
  }, [refetchTimezone, fetchEvents]);

  // Fetch events only on initial load
  useEffect(() => {
    // Don't fetch until timezone has loaded and we haven't initialized yet
    if (timezoneLoading || hasInitialized.current) {
      return;
    }
    
    console.log('Initial events fetch with timezone:', userTimezone);
    fetchEvents();
    hasInitialized.current = true;
  }, [timezoneLoading, userTimezone]); // Only run once after timezone loads

  return {
    events,
    loading,
    error,
    source,
    lastSync,
    refetch: fetchEvents,
    refreshWithTimezone
  };
} 