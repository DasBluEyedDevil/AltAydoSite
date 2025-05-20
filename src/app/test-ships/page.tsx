'use client';

import { useState } from 'react';
import UserFleetBuilder from '../../components/UserFleetBuilder';
import { UserShip } from '../../types/user';
import Link from 'next/link';

export default function TestShipsPage() {
  const [isEditing, setIsEditing] = useState(true);
  const [ships, setShips] = useState<UserShip[]>([]);
  
  const handleAddShip = (ship: UserShip) => {
    setShips(prev => [...prev, ship]);
  };
  
  const handleRemoveShip = (index: number) => {
    setShips(prev => {
      const newShips = [...prev];
      newShips.splice(index, 1);
      return newShips;
    });
  };
  
  return (
    <div className="min-h-screen bg-[rgba(var(--mg-bg),1)] p-6">
      <div className="mg-panel p-6 max-w-4xl mx-auto">
        <h1 className="text-xl mb-6 text-[rgba(var(--mg-primary),0.9)]">Fleet Builder Test Page</h1>
        
        <div className="mb-4">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="mg-button-small text-xs px-5 py-1.5 mb-5"
          >
            {isEditing ? 'VIEW MODE' : 'EDIT MODE'}
          </button>
          
          <div className="text-sm mb-3">
            Current Mode: <span className="text-[rgba(var(--mg-primary),0.9)]">{isEditing ? 'EDIT' : 'VIEW'}</span>
          </div>
          
          <div className="text-sm mb-3">
            Ship Count: <span className="text-[rgba(var(--mg-primary),0.9)]">{ships.length}</span>
          </div>
        </div>
        
        <UserFleetBuilder 
          isEditing={isEditing}
          userShips={ships}
          onAddShip={handleAddShip}
          onRemoveShip={handleRemoveShip}
        />
        
        <div className="mt-6 pt-6 border-t border-[rgba(var(--mg-primary),0.2)]">
          <h2 className="text-sm mb-3 text-[rgba(var(--mg-primary),0.9)]">Raw Ship Data:</h2>
          <pre className="bg-[rgba(var(--mg-panel-dark),0.6)] p-4 rounded-sm text-xs overflow-auto">
            {JSON.stringify(ships, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6">
          <Link 
            href="/userprofile" 
            className="text-[rgba(var(--mg-primary),0.9)] hover:text-[rgba(var(--mg-primary),1)] text-sm"
          >
            Go to User Profile
          </Link>
          {' | '}
          <Link 
            href="/reset-profile" 
            className="text-[rgba(var(--mg-error),0.9)] hover:text-[rgba(var(--mg-error),1)] text-sm"
          >
            Reset Profile Data
          </Link>
        </div>
      </div>
    </div>
  );
} 