'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '../types/UserProfile';
import { useSession } from 'next-auth/react';

const DEFAULT_PROFILE: Omit<UserProfile, 'handle' | 'email'> = {
  name: '',
  photo: '/assets/avatar-placeholder.png',
  subsidiary: 'AydoCorp HQ',
  payGrade: 'Entry Level',
  position: '',
  timezone: 'UTC+00:00',
  preferredGameplayLoops: [],
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
      
      // Try to load profile from local storage
      const savedProfile = localStorage.getItem(`user_profile_${email}`);
      
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
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
      localStorage.setItem(`user_profile_${profile.email}`, JSON.stringify(profile));
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