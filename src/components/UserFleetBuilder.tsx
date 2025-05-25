'use client';

import React, { useState, useEffect } from 'react';
import { UserShip } from '../types/user';
import { getManufacturersList, getShipsByManufacturer, formatShipImageName } from '../types/ShipData';
import Image from 'next/image';

interface UserFleetBuilderProps {
  isEditing: boolean;
  userShips: UserShip[];
  onAddShip: (ship: UserShip) => void;
  onRemoveShip: (index: number) => void;
}

const UserFleetBuilder: React.FC<UserFleetBuilderProps> = ({
  isEditing,
  userShips = [], // Provide default empty array
  onAddShip,
  onRemoveShip
}) => {
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [manufacturers] = useState<string[]>(getManufacturersList());
  const [availableShips, setAvailableShips] = useState<{ name: string; image: string }[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Update available ships when manufacturer changes
  useEffect(() => {
    if (selectedManufacturer) {
      setAvailableShips(getShipsByManufacturer(selectedManufacturer));
      setSelectedShip(''); // Reset selected ship when manufacturer changes
    } else {
      setAvailableShips([]);
    }
  }, [selectedManufacturer]);

  const handleAddShip = () => {
    if (selectedManufacturer && selectedShip) {
      const ship = availableShips.find(s => s.name === selectedShip);
      if (ship) {
        onAddShip({
          manufacturer: selectedManufacturer,
          name: ship.name,
          image: ship.image,
        });
        // Reset selections after adding
        setSelectedShip('');
      }
    }
  };

  // Handle image load error
  const handleImageError = (shipId: string) => {
    setImageErrors(prev => ({ ...prev, [shipId]: true }));
  };

  // Handle image load success
  const handleImageLoad = (shipId: string) => {
    setLoadedImages(prev => ({ ...prev, [shipId]: true }));
  };

  // Group ships by manufacturer for display
  const shipsByManufacturer = (userShips || []).reduce<Record<string, UserShip[]>>((acc, ship) => {
    if (!acc[ship.manufacturer]) {
      acc[ship.manufacturer] = [];
    }
    acc[ship.manufacturer].push(ship);
    return acc;
  }, {});

  // CSS styles for select elements to ensure dark background
  const selectStyles = {
    backgroundColor: 'rgba(var(--mg-panel-dark), 0.9)',
    color: 'rgba(var(--mg-text), 0.9)',
    borderColor: 'rgba(var(--mg-primary), 0.3)',
    // Override browser default styles for select dropdown
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(140, 160, 200, 0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1.5em',
    paddingRight: '2.5rem'
  } as React.CSSProperties;

  return (
    <div className="mt-6">
      {isEditing && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manufacturer Dropdown */}
            <div>
              <label className="block text-xs text-[rgba(var(--mg-text),0.6)] mb-2">SHIP MANUFACTURER</label>
              <select 
                value={selectedManufacturer}
                onChange={(e) => setSelectedManufacturer(e.target.value)}
                className="mg-select w-full text-base rounded-sm border border-[rgba(var(--mg-primary),0.3)] focus:border-[rgba(var(--mg-primary),0.6)] focus:outline-none p-2"
                style={selectStyles}
              >
                <option value="">Select Manufacturer</option>
                {manufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Ship Dropdown (dependent on manufacturer) */}
            <div>
              <label className="block text-xs text-[rgba(var(--mg-text),0.6)] mb-2">SHIP</label>
              <select 
                value={selectedShip}
                onChange={(e) => setSelectedShip(e.target.value)}
                className="mg-select w-full text-base rounded-sm border border-[rgba(var(--mg-primary),0.3)] focus:border-[rgba(var(--mg-primary),0.6)] focus:outline-none p-2"
                style={{
                  ...selectStyles,
                  opacity: !selectedManufacturer ? 0.5 : 1,
                }}
                disabled={!selectedManufacturer}
              >
                <option value="">Select Ship</option>
                {availableShips.map((ship) => (
                  <option key={ship.name} value={ship.name}>
                    {ship.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Add Ship Button */}
          <div>
            <button 
              onClick={handleAddShip}
              disabled={!selectedManufacturer || !selectedShip}
              className="mg-button-small text-xs px-5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ADD SHIP
            </button>
          </div>
        </div>
      )}
      
      {/* Display ships by manufacturer */}
      <div className="space-y-8">
        {Object.entries(shipsByManufacturer).length > 0 ? (
          Object.entries(shipsByManufacturer).map(([manufacturer, ships]) => (
            <div key={manufacturer} className="border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm">
              <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-4">{manufacturer}</h4>
              <div className="grid grid-cols-1 gap-6">
                {ships.map((ship, index) => {
                  const shipIndex = userShips.findIndex(s => 
                    s.manufacturer === ship.manufacturer && s.name === ship.name
                  );
                  
                  const shipId = `${ship.manufacturer}-${ship.name}`;
                  const imagePath = `/images/${ship.image}`;
                  const useDefaultImage = imageErrors[shipId] || !ship.image;
                  const isLoaded = loadedImages[shipId];
                  
                  return (
                    <div key={`${shipId}-${index}`} className="relative border border-[rgba(var(--mg-primary),0.1)] bg-[rgba(var(--mg-panel-dark),0.6)] p-4 rounded-sm">
                      {isEditing && (
                        <button 
                          onClick={() => onRemoveShip(shipIndex)}
                          className="absolute top-2 right-2 text-[rgba(var(--mg-error),0.8)] hover:text-[rgba(var(--mg-error),1)] p-1 bg-[rgba(var(--mg-panel-dark),0.7)] rounded-sm"
                          title="Remove Ship"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      
                      <div className="flex flex-col md:flex-row items-center">
                        {/* Ship image with loading state */}
                        <div className="w-full md:w-48 h-48 mb-4 md:mb-0 md:mr-6 flex-shrink-0 relative">
                          {!isLoaded && !useDefaultImage && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(var(--mg-panel-dark),0.4)]">
                              <div className="w-8 h-8 border-2 border-[rgba(var(--mg-primary),0.2)] border-t-[rgba(var(--mg-primary),0.8)] rounded-full animate-spin"></div>
                            </div>
                          )}
                          <Image 
                            src={useDefaultImage ? '/assets/ship-placeholder.png' : imagePath}
                            alt={ship.name}
                            width={192}
                            height={192}
                            className={`w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onError={() => handleImageError(shipId)}
                            onLoad={() => handleImageLoad(shipId)}
                            priority={index < 2} // Prioritize loading first two images
                          />
                        </div>
                        
                        {/* Ship details */}
                        <div className="flex-1 text-center md:text-left">
                          <h5 className="text-lg font-medium text-[rgba(var(--mg-text),0.9)] mb-2">{ship.name}</h5>
                          <p className="text-sm text-[rgba(var(--mg-text),0.7)]">Manufacturer: {ship.manufacturer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-[rgba(var(--mg-text),0.5)] py-2">No ships added to your fleet yet</div>
        )}
      </div>
    </div>
  );
};

// Add global style for dropdown select elements
export default UserFleetBuilder; 