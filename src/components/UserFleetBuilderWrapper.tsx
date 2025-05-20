'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UserFleetBuilder from './UserFleetBuilder';
import { UserShip } from '../types/user';
import { getManufacturersList, getShipsByManufacturer } from '../types/ShipData';

// Safe access to localStorage that works in both client and server environments
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }
};

/**
 * A standalone wrapper for the UserFleetBuilder component that manages its own state
 * and localStorage interactions, independent of the main profile state.
 */
interface UserFleetBuilderWrapperProps {
  isEditing: boolean; // This prop will come from the parent component
  onShipsChange?: (ships: UserShip[]) => void; // Callback to notify parent of ship changes
}

export default function UserFleetBuilderWrapper({ 
  isEditing, 
  onShipsChange 
}: UserFleetBuilderWrapperProps) {
  const { data: session, status } = useSession();
  const [ships, setShips] = useState<UserShip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ships from API on component mount
  useEffect(() => {
    if (status === 'loading') {
      return; // Wait for session to be fully loaded
    }
    
    if (session?.user?.email) {
      console.log('Session loaded, user authenticated:', session.user.email);
      fetchShipsFromAPI();
    } else {
      console.log('No authenticated user session found');
      setIsLoading(false);
    }
  }, [session, status]);

  // Fetch ships data from the API
  const fetchShipsFromAPI = async () => {
    setError(null);
    try {
      console.log('Fetching ships from API...');
      const response = await fetch('/api/profile', {
        headers: {
          'Cache-Control': 'no-cache' // Prevent caching issues
        },
        credentials: 'include' // Include session cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        
        // Handle 401 Unauthorized errors differently - just fall back to local storage
        if (response.status === 401) {
          console.log('User not authenticated, falling back to local storage');
          loadShipsFromLocalStorage();
          setIsLoading(false);
          return; // Early return to avoid throwing error
        }
        
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }
      
      const profileData = await response.json();
      
      console.log('Profile API response:', {
        hasShipsProperty: 'ships' in profileData,
        shipsIsArray: Array.isArray(profileData.ships),
        shipsLength: profileData.ships?.length || 0
      });
      
      if (profileData.ships) {
        console.log('Successfully loaded ships from API:', profileData.ships);
        setShips(profileData.ships);
      } else {
        console.log('No ships data in API response, using empty array');
        setShips([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching ships from API:', error);
      setError(`Failed to load ships: ${errorMessage}`);
      
      // Fallback to localStorage
      console.log('Falling back to localStorage for ships data');
      loadShipsFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback: Load ships from localStorage
  const loadShipsFromLocalStorage = () => {
    try {
      if (typeof window === 'undefined' || !session?.user?.email) {
        console.log('Cannot load from localStorage - no window or user email');
        return;
      }
      
      // Try both keys to support both v1 and v2 profiles
      const v1Key = `user_profile_v1_${session.user.email}`;
      const v2Key = `user_profile_v2_${session.user.email}`;
      
      console.log('Trying to load ships from localStorage keys:', { v1Key, v2Key });
      
      // Get data from localStorage using the safe wrapper
      const v1Data = safeLocalStorage.getItem(v1Key);
      const v2Data = safeLocalStorage.getItem(v2Key);
      
      console.log('Found localStorage data:', {
        v1Found: !!v1Data,
        v2Found: !!v2Data
      });
      
      // Parse the data
      let loadedShips: UserShip[] = [];
      
      // Try v2 first, fall back to v1
      if (v2Data) {
        const profile = JSON.parse(v2Data);
        console.log('v2 profile data:', {
          hasShips: !!profile.ships,
          shipCount: profile.ships ? profile.ships.length : 0
        });
        loadedShips = profile.ships || [];
        console.log('Loaded ships from v2 localStorage:', loadedShips);
      } else if (v1Data) {
        const profile = JSON.parse(v1Data);
        console.log('v1 profile data:', {
          hasShips: !!profile.ships,
          shipCount: profile.ships ? profile.ships.length : 0
        });
        loadedShips = profile.ships || [];
        console.log('Loaded ships from v1 localStorage:', loadedShips);
      }
      
      // Update state
      setShips(loadedShips);
    } catch (error) {
      console.error('Error loading ships from localStorage:', error);
      // Initialize with empty array on error
      setShips([]);
    }
  };

  // Save ships to both localStorage and server
  const saveShipsToServer = async (shipsToSave: UserShip[]) => {
    if (!session?.user?.email) {
      console.warn('Cannot save ships - no authenticated user');
      return;
    }
    
    console.log('Saving ships to server and localStorage:', shipsToSave);
    setError(null);
    
    // Save to localStorage
    try {
      const v2Key = `user_profile_v2_${session.user.email}`;
      let profile = {};
      
      const profileData = safeLocalStorage.getItem(v2Key);
      if (profileData) {
        profile = JSON.parse(profileData);
      }
      
      // Update ships in the profile
      profile = {
        ...profile,
        ships: shipsToSave
      };
      
      // Save back to localStorage using the safe wrapper
      safeLocalStorage.setItem(v2Key, JSON.stringify(profile));
      console.log('Saved ships to localStorage successfully');
    } catch (error) {
      console.error('Error saving ships to localStorage:', error);
    }
    
    // Save to API
    try {
      console.log('Sending ships to API:', shipsToSave);
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          ships: shipsToSave
        }),
      });
      
      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const errorMsg = responseData?.error || response.statusText || 'Unknown error';
        console.error('Failed to save ships to server:', errorMsg, responseData);
        setError(`Failed to save ships: ${errorMsg}`);
      } else {
        console.log('Ships saved to server successfully', responseData);
        
        // Verify the saved ships in the response
        if (responseData.ships) {
          console.log('Server returned updated ships:', responseData.ships.length);
          
          // Check if all ships were saved correctly
          if (responseData.ships.length !== shipsToSave.length) {
            console.warn('Warning: Server returned different number of ships than we saved');
          }
        }
        
        // Notify parent component of the ships change
        if (onShipsChange) {
          console.log('Notifying parent of ship changes:', shipsToSave);
          onShipsChange(shipsToSave);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving ships to server:', error);
      setError(`Failed to save ships: ${errorMessage}`);
    }
  };

  // Handler for adding a ship to the fleet
  const handleAddShip = (ship: UserShip) => {
    console.log('Adding ship:', ship);
    setShips(currentShips => {
      const newShips = [...currentShips, ship];
      // Immediately sync with server
      saveShipsToServer(newShips);
      return newShips;
    });
  };

  // Handler for removing a ship from the fleet
  const handleRemoveShip = (index: number) => {
    console.log('Removing ship at index:', index);
    setShips(currentShips => {
      const newShips = [...currentShips];
      newShips.splice(index, 1);
      // Immediately sync with server
      saveShipsToServer(newShips);
      return newShips;
    });
  };

  // For debugging purposes - show error if one occurred
  if (error) {
    console.error('Fleet Builder Error:', error);
  }

  if (isLoading) {
    return (
      <div className="mt-4 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-[rgba(var(--mg-primary),0.1)] rounded-sm"></div>
          <div className="mt-4 h-24 bg-[rgba(var(--mg-primary),0.1)] rounded-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
      <h3 className="block text-xs text-[rgba(var(--mg-text),0.6)] font-bold mb-4">FLEET</h3>
      
      <UserFleetBuilder 
        isEditing={isEditing}
        userShips={ships}
        onAddShip={handleAddShip}
        onRemoveShip={handleRemoveShip}
      />
      
      {error && !error.includes("401") && !error.includes("Unauthorized") && (
        <div className="mt-4 p-2 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] text-xs rounded-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fleet data could not be saved to server. Your ships are stored locally only.
          </div>
        </div>
      )}
    </div>
  );
} 