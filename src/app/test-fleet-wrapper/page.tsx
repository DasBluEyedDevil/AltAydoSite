'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import UserFleetBuilderWrapper from '../../components/UserFleetBuilderWrapper';
import { UserShip } from '../../types/user';

export default function TestFleetWrapperPage() {
  // Block access in production
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const [isEditing, setIsEditing] = useState(false);
  const [ships, setShips] = useState<UserShip[]>([]);

  // Handler for ship changes
  const handleShipsChange = (updatedShips: UserShip[]) => {
    setShips(updatedShips);
    console.log('Ships updated:', updatedShips);
  };

  return (
    <div className="min-h-screen bg-[rgba(var(--mg-bg),1)] p-6">
      <div className="mg-panel p-6 max-w-4xl mx-auto">
        <h1 className="text-xl mb-6 text-[rgba(var(--mg-primary),0.9)]">Fleet Builder Wrapper Test</h1>
        
        <div className="text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          <p>This page tests the UserFleetBuilderWrapper component, which manages its own state and localStorage interactions.</p>
          <p className="mt-2">Ships added here will be saved to your profile&apos;s localStorage and will appear in your user profile.</p>
        </div>

        <div className="mb-4">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="mg-button-small text-xs px-5 py-1.5"
          >
            {isEditing ? 'EXIT EDIT MODE' : 'ENTER EDIT MODE'}
          </button>
          
          <div className="text-sm mt-2">
            Current Mode: <span className="text-[rgba(var(--mg-primary),0.9)]">{isEditing ? 'EDIT' : 'VIEW'}</span>
          </div>
          
          <div className="text-sm mt-2">
            Ship Count: <span className="text-[rgba(var(--mg-primary),0.9)]">{ships.length}</span>
          </div>
        </div>
        
        <div className="my-4 border-2 border-[rgba(var(--mg-primary),0.5)] p-4">
          <div className="text-sm mb-2 text-[rgba(var(--mg-primary),0.9)]">FLEET BUILDER WRAPPER COMPONENT:</div>
          <UserFleetBuilderWrapper 
            isEditing={isEditing} 
            onShipsChange={handleShipsChange}
          />
        </div>
        
        <div className="mt-6 pt-6 border-t border-[rgba(var(--mg-primary),0.2)]">
          <h2 className="text-sm mb-2 text-[rgba(var(--mg-primary),0.9)]">Current Ships:</h2>
          <pre className="bg-[rgba(var(--mg-panel-dark),0.6)] p-4 rounded-sm text-xs overflow-auto">
            {JSON.stringify(ships, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 pt-6 border-t border-[rgba(var(--mg-primary),0.2)]">
          <h2 className="text-sm mb-3 text-[rgba(var(--mg-primary),0.9)]">Navigation</h2>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/userprofile" 
              className="text-[rgba(var(--mg-primary),0.9)] hover:text-[rgba(var(--mg-primary),1)] text-sm"
            >
              Go to User Profile
            </Link>
            <Link 
              href="/test-fleet" 
              className="text-[rgba(var(--mg-primary),0.9)] hover:text-[rgba(var(--mg-primary),1)] text-sm"
            >
              Original Fleet Builder Test
            </Link>
            <Link 
              href="/debug-profile" 
              className="text-[rgba(var(--mg-warning),0.9)] hover:text-[rgba(var(--mg-warning),1)] text-sm"
            >
              Debug Profile
            </Link>
            <Link 
              href="/reset-profile" 
              className="text-[rgba(var(--mg-error),0.9)] hover:text-[rgba(var(--mg-error),1)] text-sm"
            >
              Reset Profile Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 