import { useState, useEffect, useCallback } from 'react';
import { EventData, EventType } from '@/lib/eventMapper';

// Fallback events (original hardcoded events)
const fallbackEvents: EventData[] = [
  {
    id: 1,
    title: 'Weekly Community Gathering',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2),
    time: '20:00 UTC',
    type: EventType.General,
    description: 'Our weekly community meetup for all members to socialize and plan activities.'
  },
  {
    id: 2,
    title: 'Cargo Run Training',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 4),
    time: '18:30 UTC',
    type: EventType.AydoExpress,
    description: 'Training session for new AydoExpress employees on cargo management and hauling operations.'
  },
  {
    id: 3,
    title: 'Mining Expedition',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5),
    time: '19:00 UTC',
    type: EventType.EmpyrionIndustries,
    description: 'Joint mining operation in the Aaron Halo asteroid belt. All mining vessels welcome.'
  },
  {
    id: 4,
    title: 'Fleet Week Preparation',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7),
    time: '21:00 UTC',
    type: EventType.General,
    description: 'Preparation meeting for the upcoming Fleet Week event. All departments should send representatives.'
  },
  {
    id: 5,
    title: 'Logistics Route Planning',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 9),
    time: '19:30 UTC',
    type: EventType.AydoExpress,
    description: 'Strategic meeting to plan new trade routes and optimize existing ones.'
  }
];

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
  const [events, setEvents] = useState<EventData[]>(fallbackEvents);
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
        // Discord integration failed, use fallback
        console.warn('Discord events unavailable, using fallback events:', data.error);
        setEvents(fallbackEvents);
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
        // No events from Discord, use fallback
        setEvents(fallbackEvents);
        setSource('fallback');
        setError('No Discord events found');
      }

    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      setEvents(fallbackEvents);
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