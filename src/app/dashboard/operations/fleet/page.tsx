'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Ship {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  role: string;
  status: 'Ready' | 'Maintenance' | 'In Use' | 'Damaged';
  location: string;
  crew: number;
  imageUrl: string;
}

const sampleShips: Ship[] = [
  {
    id: 'ship-001',
    name: 'Stellar Voyager',
    manufacturer: 'RSI',
    model: 'Constellation Andromeda',
    role: 'Multi-role',
    status: 'Ready',
    location: 'Area18 Hangar',
    crew: 4,
    imageUrl: '/images/ships/constellation.jpg'
  },
  {
    id: 'ship-002',
    name: 'Cargo Master',
    manufacturer: 'MISC',
    model: 'Hull C',
    role: 'Cargo',
    status: 'In Use',
    location: 'En route to Hurston',
    crew: 3,
    imageUrl: '/images/ships/hull-c.jpg'
  },
  {
    id: 'ship-003',
    name: 'Shadow Runner',
    manufacturer: 'Drake',
    model: 'Cutlass Black',
    role: 'Multi-role',
    status: 'Ready',
    location: 'New Babbage Spaceport',
    crew: 2,
    imageUrl: '/images/ships/cutlass-black.jpg'
  },
  {
    id: 'ship-004',
    name: 'Mining Chief',
    manufacturer: 'MISC',
    model: 'Prospector',
    role: 'Mining',
    status: 'Maintenance',
    location: 'Lorville Repair Bay',
    crew: 1,
    imageUrl: '/images/ships/prospector.jpg'
  },
  {
    id: 'ship-005',
    name: 'Reclaimer Alpha',
    manufacturer: 'Aegis',
    model: 'Reclaimer',
    role: 'Salvage',
    status: 'In Use',
    location: 'Salvage operation near Yela',
    crew: 8,
    imageUrl: '/images/ships/reclaimer.jpg'
  },
  {
    id: 'ship-006',
    name: 'Patrol Eagle',
    manufacturer: 'Anvil',
    model: 'F8 Lightning',
    role: 'Combat',
    status: 'Ready',
    location: 'Grim HEX',
    crew: 1,
    imageUrl: '/images/ships/f8-lightning.jpg'
  }
];

// Loading overlay component
const LoadingOverlay = ({ text }: { text: string }) => (
  <motion.div 
    className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="relative h-32 w-32 mb-8">
      <Image 
        src="/images/Aydo_Corp_logo_Silver.png" 
        alt="AydoCorp Logo" 
        fill
        className="object-contain animate-pulse" 
      />
    </div>
    
    <h2 className="mg-title text-xl mb-4">{text}</h2>
    
    <div className="w-64 h-1 bg-[rgba(var(--mg-panel-dark),0.5)] relative overflow-hidden rounded-full">
      <motion.div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.5)] to-[rgba(var(--mg-primary),0.8)]"
        animate={{ 
          x: ['-100%', '100%'],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut" 
        }}
        style={{ width: '50%' }}
      />
    </div>
  </motion.div>
);

export default function FleetDatabasePage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Ship['status'] | 'All'>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  
  // Initialize with a delay to simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Extract unique roles for filtering
  const uniqueRoles = Array.from(new Set(sampleShips.map(ship => ship.role)));
  
  // Filter ships based on search and filters
  const filteredShips = sampleShips.filter(ship => {
    const matchesSearch = 
      ship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ship.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ship.model.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || ship.status === statusFilter;
    const matchesRole = roleFilter === 'All' || ship.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });
  
  // Get status color
  const getStatusColor = (status: Ship['status']) => {
    switch (status) {
      case 'Ready':
        return 'bg-green-500';
      case 'In Use':
        return 'bg-blue-500';
      case 'Maintenance':
        return 'bg-yellow-500';
      case 'Damaged':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="min-h-screen bg-black bg-opacity-95 p-4 md:p-6 relative">
      {/* Holographic background effects */}
      <div className="absolute inset-0 bg-holo-grid bg-[length:50px_50px] opacity-5 pointer-events-none"></div>
      <div className="hexagon-bg absolute inset-0 opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="mg-title text-2xl sm:text-3xl lg:text-4xl mb-4">Fleet Database</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.7)] to-transparent"></div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isInitialized ? 1 : 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Panel - Ship List */}
          <div className="lg:col-span-2">
            <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="mg-title text-lg font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)]">
                  REGISTERED VESSELS
                </h2>
                
                <div className="flex space-x-2">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Search fleet..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mg-input w-40 md:w-64 px-3 py-1 text-sm"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[rgba(var(--mg-text),0.5)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mb-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Ship['status'] | 'All')}
                  className="mg-select text-sm px-3 py-1"
                >
                  <option value="All">All Statuses</option>
                  <option value="Ready">Ready</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Damaged">Damaged</option>
                </select>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="mg-select text-sm px-3 py-1"
                >
                  <option value="All">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 max-h-[60vh] overflow-y-auto mg-scrollbar pr-2">
                {filteredShips.length > 0 ? (
                  filteredShips.map(ship => (
                    <motion.div
                      key={ship.id}
                      className={`p-3 border mg-panel cursor-pointer ${
                        selectedShip?.id === ship.id 
                          ? 'border-[rgba(var(--mg-primary),0.6)] bg-[rgba(var(--mg-panel-dark),0.7)]'
                          : 'border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)] hover:bg-[rgba(var(--mg-panel-dark),0.5)]'
                      }`}
                      onClick={() => setSelectedShip(ship)}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="mg-title text-[rgba(var(--mg-primary),0.9)]">{ship.name}</h3>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(ship.status)}`} title={ship.status}></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                        <div className="text-[rgba(var(--mg-text),0.6)]">Manufacturer:</div>
                        <div className="mg-text">{ship.manufacturer}</div>
                        
                        <div className="text-[rgba(var(--mg-text),0.6)]">Model:</div>
                        <div className="mg-text">{ship.model}</div>
                        
                        <div className="text-[rgba(var(--mg-text),0.6)]">Role:</div>
                        <div className="mg-text">{ship.role}</div>
                        
                        <div className="text-[rgba(var(--mg-text),0.6)]">Location:</div>
                        <div className="mg-text truncate">{ship.location}</div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center p-6 mg-text text-[rgba(var(--mg-text),0.6)]">
                    No ships found matching your criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Ship Details */}
          <div>
            <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
              
              <h2 className="mg-title text-lg font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)] mb-4">
                VESSEL DETAILS
              </h2>
              
              {selectedShip ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="mg-title text-xl">{selectedShip.name}</h3>
                    <div className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedShip.status)} text-white`}>
                      {selectedShip.status}
                    </div>
                  </div>
                  
                  <div className="mb-4 relative h-48 rounded overflow-hidden mg-panel-dark">
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(var(--mg-panel-dark),0.7)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[rgba(var(--mg-text),0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div className="absolute bottom-2 right-2 text-xs text-[rgba(var(--mg-text),0.6)]">
                      Ship image placeholder
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="mg-panel-dark p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Manufacturer</div>
                      <div className="mg-title text-lg">{selectedShip.manufacturer}</div>
                    </div>
                    
                    <div className="mg-panel-dark p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Model</div>
                      <div className="mg-title text-lg">{selectedShip.model}</div>
                    </div>
                    
                    <div className="mg-panel-dark p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Role</div>
                      <div className="mg-title text-lg">{selectedShip.role}</div>
                    </div>
                    
                    <div className="mg-panel-dark p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Crew Size</div>
                      <div className="mg-title text-lg">{selectedShip.crew}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs text-[rgba(var(--mg-text),0.6)] mb-1">Current Location</div>
                    <div className="mg-panel-dark p-3">
                      <div className="flex items-center">
                        <div className="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="mg-text">
                          {selectedShip.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="mg-btn bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] text-[rgba(var(--mg-primary),0.9)] hover:bg-[rgba(var(--mg-primary),0.3)] px-4 py-2 flex-1">
                      <span className="font-quantify tracking-wider">ASSIGN MISSION</span>
                    </button>
                    <button className="mg-btn-secondary px-4 py-2">
                      <span className="font-quantify tracking-wider">SHIP LOG</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="mb-4 text-[rgba(var(--mg-text),0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <p className="mg-text text-[rgba(var(--mg-text),0.6)]">
                    Select a vessel to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {!isInitialized && (
            <LoadingOverlay text="Initializing Fleet Database" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 