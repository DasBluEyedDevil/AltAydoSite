import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useUserTimezone(): {
  timezone: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const { data: session, status } = useSession();
  const [timezone, setTimezone] = useState<string>('UTC');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchUserTimezone = useCallback(async () => {
    if (status === 'loading') {
      return; // Wait for session to load
    }

    if (status === 'unauthenticated' || !session?.user) {
      // User not logged in, use UTC as default
      setTimezone('UTC');
      setLoading(false);
      hasInitialized.current = true;
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/profile', {
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn(`Failed to fetch profile: ${response.status}`);
        setTimezone('UTC');
        setError(`Failed to fetch profile: ${response.status}`);
        return;
      }

      const profileData = await response.json();
      
      // Use user's timezone or fallback to UTC
      const newTimezone = profileData.timezone || 'UTC';
      console.log('Fetched user timezone:', newTimezone);
      setTimezone(newTimezone);
      setError(null);
    } catch (err) {
      console.warn('Failed to fetch user timezone, using UTC:', err);
      setTimezone('UTC');
      setError(err instanceof Error ? err.message : 'Failed to fetch timezone');
    } finally {
      setLoading(false);
      hasInitialized.current = true;
    }
  }, [status, session]);

  useEffect(() => {
    // Only fetch on initial load, not on every session change
    if (!hasInitialized.current && status !== 'loading') {
      fetchUserTimezone();
    }
  }, [status, fetchUserTimezone]); // Depend on status and memoized fetch

  return { 
    timezone, 
    loading, 
    error, 
    refetch: fetchUserTimezone 
  };
}
