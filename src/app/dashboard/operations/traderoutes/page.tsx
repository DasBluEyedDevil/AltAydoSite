'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface TradeRoute {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  commodity: string;
  profitPerUnit: number;
  totalCapacity: number;
  distance: number;
  estimatedTime: string;
  risk: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Inactive' | 'Maintenance';
}

const sampleTradeRoutes: TradeRoute[] = [
  {
    id: 'tr-001',
    name: 'Stanton Mining Run',
    startLocation: 'Lyria',
    endLocation: 'Area18',
    commodity: 'Quantanium',
    profitPerUnit: 88.5,
    totalCapacity: 32000,
    distance: 42,
    estimatedTime: '15 minutes',
    risk: 'Low',
    status: 'Active'
  },
  {
    id: 'tr-002',
    name: 'Crusader Supply Chain',
    startLocation: 'Orison',
    endLocation: 'Port Olisar',
    commodity: 'Medical Supplies',
    profitPerUnit: 32.7,
    totalCapacity: 96000,
    distance: 15,
    estimatedTime: '8 minutes',
    risk: 'Low',
    status: 'Active'
  },
  {
    id: 'tr-003',
    name: 'Microtech Smuggler Run',
    startLocation: 'New Babbage',
    endLocation: 'Levski',
    commodity: 'Widow',
    profitPerUnit: 175.2,
    totalCapacity: 16000,
    distance: 108,
    estimatedTime: '30 minutes',
    risk: 'High',
    status: 'Active'
  },
  {
    id: 'tr-004',
    name: 'ArcCorp Agricultural Route',
    startLocation: 'Wala',
    endLocation: 'Area18',
    commodity: 'Agricultural Supplies',
    profitPerUnit: 15.3,
    totalCapacity: 128000,
    distance: 35,
    estimatedTime: '12 minutes',
    risk: 'Low',
    status: 'Active'
  },
  {
    id: 'tr-005',
    name: 'Hurston Minerals Transport',
    startLocation: 'Aberdeen',
    endLocation: 'Lorville',
    commodity: 'Titanium',
    profitPerUnit: 42.8,
    totalCapacity: 64000,
    distance: 28,
    estimatedTime: '10 minutes',
    risk: 'Medium',
    status: 'Maintenance'
  },
  {
    id: 'tr-006',
    name: 'Pyro Expeditionary Route',
    startLocation: 'Ruin Station',
    endLocation: 'MicroTech',
    commodity: 'Exotic Materials',
    profitPerUnit: 312.6,
    totalCapacity: 8000,
    distance: 240,
    estimatedTime: '1 hour 20 minutes',
    risk: 'High',
    status: 'Inactive'
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

export default function TradeRoutesPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TradeRoute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TradeRoute['status'] | 'All'>('All');
  const [riskFilter, setRiskFilter] = useState<TradeRoute['risk'] | 'All'>('All');
  
  // Initialize with a delay to simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter trade routes based on search and filters
  const filteredRoutes = sampleTradeRoutes.filter(route => {
    const matchesSearch = 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.endLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.commodity.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || route.status === statusFilter;
    const matchesRisk = riskFilter === 'All' || route.risk === riskFilter;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });
  
  // Get status color
  const getStatusColor = (status: TradeRoute['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Inactive':
        return 'bg-red-500';
      case 'Maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get risk color
  const getRiskColor = (risk: TradeRoute['risk']) => {
    switch (risk) {
      case 'Low':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'High':
        return 'text-red-400';
      default:
        return 'text-gray-400';
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
          <h1 className="mg-title text-2xl sm:text-3xl lg:text-4xl mb-4">Trade Route Database</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.7)] to-transparent"></div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isInitialized ? 1 : 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Panel - Trade Route List */}
          <div className="lg:col-span-2">
            <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="mg-title text-lg font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)]">
                  REGISTERED TRADE ROUTES
                </h2>
                
                <div className="flex space-x-2">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Search routes..."
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
                  onChange={(e) => setStatusFilter(e.target.value as TradeRoute['status'] | 'All')}
                  className="mg-select text-sm px-3 py-1"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value as TradeRoute['risk'] | 'All')}
                  className="mg-select text-sm px-3 py-1"
                >
                  <option value="All">All Risk Levels</option>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
              
              <div className="space-y-2 max-h-[60vh] overflow-y-auto mg-scrollbar pr-2">
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map(route => (
                    <motion.div
                      key={route.id}
                      className={`p-3 border mg-panel cursor-pointer ${
                        selectedRoute?.id === route.id 
                          ? 'border-[rgba(var(--mg-primary),0.6)] bg-[rgba(var(--mg-panel-dark),0.7)]'
                          : 'border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)] hover:bg-[rgba(var(--mg-panel-dark),0.5)]'
                      }`}
                      onClick={() => setSelectedRoute(route)}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="mg-title text-[rgba(var(--mg-primary),0.9)]">{route.name}</h3>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(route.status)}`} title={route.status}></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                        <div className="text-[rgba(var(--mg-text),0.6)]">Route:</div>
                        <div className="mg-text">{route.startLocation} → {route.endLocation}</div>
                        
                        <div className="text-[rgba(var(--mg-text),0.6)]">Commodity:</div>
                        <div className="mg-text">{route.commodity}</div>
                        
                        <div className="text-[rgba(var(--mg-text),0.6)]">Profit:</div>
                        <div className="mg-text">{route.profitPerUnit.toFixed(2)} aUEC/unit</div>
                        
                        <div className="text-[rgba(var(--mg-text),0.6)]">Risk Level:</div>
                        <div className={`mg-text ${getRiskColor(route.risk)}`}>{route.risk}</div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center p-6 mg-text text-[rgba(var(--mg-text),0.6)]">
                    No trade routes found matching your criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Trade Route Details */}
          <div>
            <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
              
              <h2 className="mg-title text-lg font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)] mb-4">
                ROUTE DETAILS
              </h2>
              
              {selectedRoute ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="mg-title text-xl">{selectedRoute.name}</h3>
                    <div className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedRoute.status)} text-white`}>
                      {selectedRoute.status}
                    </div>
                  </div>
                  
                  <div className="mg-panel-dark p-3 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Origin</div>
                        <div className="mg-title text-sm">{selectedRoute.startLocation}</div>
                      </div>
                      
                      <div className="flex-1 px-2">
                        <div className="h-px w-full bg-[rgba(var(--mg-primary),0.3)] relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-center text-xs text-[rgba(var(--mg-text),0.6)] mt-1">
                          {selectedRoute.distance} million km
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Destination</div>
                        <div className="mg-title text-sm">{selectedRoute.endLocation}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="mg-panel-dark p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Commodity</div>
                      <div className="mg-title text-lg">{selectedRoute.commodity}</div>
                    </div>
                    
                    <div className="mg-panel-dark p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Est. Travel Time</div>
                      <div className="mg-title text-lg">{selectedRoute.estimatedTime}</div>
                    </div>
                    
                    <div className="mg-panel-dark p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Profit Per Unit</div>
                      <div className="mg-title text-lg">{selectedRoute.profitPerUnit.toFixed(2)} aUEC</div>
                    </div>
                    
                    <div className="mg-panel-dark p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)]">Total Capacity</div>
                      <div className="mg-title text-lg">{selectedRoute.totalCapacity.toLocaleString()} SCU</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs text-[rgba(var(--mg-text),0.6)] mb-1">Risk Assessment</div>
                    <div className={`mg-panel-dark p-3 ${
                      selectedRoute.risk === 'High' ? 'border-red-500' :
                      selectedRoute.risk === 'Medium' ? 'border-yellow-500' :
                      'border-green-500'
                    } border`}>
                      <div className="flex items-center">
                        <div className={`mr-2 ${getRiskColor(selectedRoute.risk)}`}>
                          {selectedRoute.risk === 'High' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : selectedRoute.risk === 'Medium' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="mg-text">
                          {selectedRoute.risk === 'High' ? 'High risk route. Armed escort recommended.' :
                           selectedRoute.risk === 'Medium' ? 'Medium risk. Basic defenses advised.' :
                           'Low risk route. Standard precautions sufficient.'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="mg-btn bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] text-[rgba(var(--mg-primary),0.9)] hover:bg-[rgba(var(--mg-primary),0.3)] px-4 py-2 flex-1">
                      <span className="font-quantify tracking-wider">ASSIGN TRANSPORT</span>
                    </button>
                    <button className="mg-btn-secondary px-4 py-2">
                      <span className="font-quantify tracking-wider">VIEW STATS</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="mb-4 text-[rgba(var(--mg-text),0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <p className="mg-text text-[rgba(var(--mg-text),0.6)]">
                    Select a trade route to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {!isInitialized && (
            <LoadingOverlay text="Initializing Trade Route Database" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 