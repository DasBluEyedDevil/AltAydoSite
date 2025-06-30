import { useState, useEffect, useCallback } from 'react';
import { EventData, EventType } from '@/lib/eventMapper';

// No fallback events - only pull from Discord

interface UseEventsReturn {
  events: EventData[];
  loading: boolean;
  error: string | null;
  source: 'discord' | 'fallback';
  lastSync: string | null;
  refetch: () => Promise<void>;
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
        // Convert date strings back to Date objects
        const processedEvents = data.events.map(event => ({
          ...event,
          date: new Date(event.date)
        }));
        
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
  }, []);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    source,
    lastSync,
    refetch: fetchEvents
  };
} 