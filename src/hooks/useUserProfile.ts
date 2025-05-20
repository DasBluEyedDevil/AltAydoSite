'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '../types/UserProfile';
import { useSession } from 'next-auth/react';

// Added a version to the profile storage key to force refresh
const PROFILE_VERSION = 'v1';

const DEFAULT_PROFILE: Omit<UserProfile, 'handle' | 'email'> = {
  name: '',
  photo: '/assets/avatar-placeholder.png',
  subsidiary: 'AydoCorp HQ',
  payGrade: 'Entry Level',
  position: '',
  timezone: 'UTC+00:00',
  preferredGameplayLoops: [],
  ships: [],
};

export function useUserProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize profile from local storage or defaults
  useEffect(() => {
    if (session?.user) {
      const handle = session.user.name || '';
      const email = session.user.email || '';
      
      // Use versioned key for profile storage
      const profileKey = `user_profile_${PROFILE_VERSION}_${email}`;
      
      // Try to load profile from local storage
      const savedProfile = localStorage.getItem(profileKey);
      
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          // Ensure ships array exists even in old profiles
          if (!parsedProfile.ships) {
            parsedProfile.ships = [];
          }
          setProfile(parsedProfile);
        } catch (e) {
          console.error('Failed to parse profile data:', e);
          setProfile({
            ...DEFAULT_PROFILE,
            name: session.user.name || '',
            photo: session.user.image || DEFAULT_PROFILE.photo,
            handle,
            email,
          });
        }
      } else {
        // Create a new profile with defaults
        setProfile({
          ...DEFAULT_PROFILE,
          name: session.user.name || '',
          photo: session.user.image || DEFAULT_PROFILE.photo,
          handle,
          email,
        });
      }
      setIsLoading(false);
    }
  }, [session]);

  // Save to local storage whenever the profile changes
  useEffect(() => {
    if (profile && profile.email) {
      // Use versioned key for profile storage
      const profileKey = `user_profile_${PROFILE_VERSION}_${profile.email}`;
      localStorage.setItem(profileKey, JSON.stringify(profile));
    }
  }, [profile]);

  // Update the profile
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
  };
} 