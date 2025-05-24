'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import MobiGlasPanel from '@/components/dashboard/MobiGlasPanel';
import MissionList from '@/components/fleet-ops/mission-planner/MissionList';
import MissionFilters from '@/components/fleet-ops/mission-planner/MissionFilters';
import MissionForm from '@/components/fleet-ops/mission-planner/MissionForm';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';

// Placeholder mission data
const mockMissions: MissionResponse[] = [
  {
    id: '1',
    name: 'Operation Stardust',
    type: 'Cargo Haul',
    scheduledDateTime: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    status: 'Planning',
    briefSummary: 'Transport critical supplies to Terra Prime.',
    details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis magna nec tortor cursus, a ultrices ex gravida.',
    location: 'Terra Prime - Port Tressler',
    leaderId: 'user1',
    leaderName: 'Cmdr. Alex Riker',
    images: [],
    participants: [
      { userId: 'user1', userName: 'Cmdr. Alex Riker', shipId: 'ship1', shipName: 'RSI Constellation Phoenix', shipType: 'Multi-crew', roles: ['Commander'] },
      { userId: 'user2', userName: 'Lt. Sarah Chen', shipId: 'ship2', shipName: 'Drake Cutlass Red', shipType: 'Medical', roles: ['Medical Officer'] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Operation Firestorm',
    type: 'Combat Patrol',
    scheduledDateTime: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    status: 'Briefing',
    briefSummary: 'Patrol the Stanton-Pyro jump point for hostile activity.',
    details: 'Increased pirate activity has been reported near the jump point. A show of force is required to deter further incursions.',
    location: 'Stanton System - Pyro Jump Point',
    leaderId: 'user3',
    leaderName: 'Maj. John Reeves',
    images: [],
    participants: [
      { userId: 'user3', userName: 'Maj. John Reeves', shipId: 'ship3', shipName: 'Anvil F8 Lightning', shipType: 'Heavy Fighter', roles: ['Squad Leader'] },
      { userId: 'user4', userName: 'Cpt. Emily Wong', shipId: 'ship4', shipName: 'Aegis Vanguard Warden', shipType: 'Heavy Fighter', roles: ['Wingman'] },
      { userId: 'user5', userName: 'Lt. David Parks', shipId: 'ship5', shipName: 'Origin 325a', shipType: 'Light Fighter', roles: ['Scout'] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Project Reclamation',
    type: 'Salvage Operation',
    scheduledDateTime: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    status: 'In Progress',
    briefSummary: 'Salvage operations at the wreckage of a Bengal carrier.',
    details: 'An ancient Bengal carrier has been discovered in a remote asteroid field. The operation involves salvaging valuable components and data cores.',
    location: 'Aaron Halo - Sector 12',
    leaderId: 'user6',
    leaderName: 'Eng. Olivia Martinez',
    images: [],
    participants: [
      { userId: 'user6', userName: 'Eng. Olivia Martinez', shipId: 'ship6', shipName: 'MISC Starfarer', shipType: 'Refueling', roles: ['Operations Lead'] },
      { userId: 'user7', userName: 'Tech. James Wilson', shipId: 'ship7', shipName: 'Drake Vulture', shipType: 'Salvage', roles: ['Salvage Specialist'] },
      { userId: 'user8', userName: 'Sec. Michael Chen', shipId: 'ship8', shipName: 'Aegis Avenger Stalker', shipType: 'Light Fighter', roles: ['Security'] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function MissionPlannerPage() {
  const { data: session, status } = useSession();
  const [missions, setMissions] = useState<MissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MissionType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedMission, setSelectedMission] = useState<MissionResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<MissionResponse | null>(null);
  
  // All users can create missions without role restrictions
  const canCreateMissions = true;
  
  // Fetch missions (mock for now)
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, this would be an API call
        // const response = await fetch('/api/missions');
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setMissions(mockMissions);
          setLoading(false);
        }, 1000); // Simulate loading
        
      } catch (err: any) {
        setError('Failed to fetch missions');
        setLoading(false);
        console.error('Error fetching missions:', err);
      }
    };
    
    fetchMissions();
  }, []);
  
  // Filter and sort missions
  const filteredMissions = missions
    .filter(mission => {
      if (statusFilter !== 'all' && mission.status !== statusFilter) return false;
      if (typeFilter !== 'all' && mission.type !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.scheduledDateTime).getTime();
      const dateB = new Date(b.scheduledDateTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  
  // Handle mission click
  const handleMissionClick = (mission: MissionResponse) => {
    setSelectedMission(mission);
    setEditingMission(mission);
    setIsFormOpen(true);
  };
  
  // Handle create new mission
  const handleCreateMission = () => {
    setEditingMission(null);
    setIsFormOpen(true);
  };
  
  // Handle save mission
  const handleSaveMission = (mission: MissionResponse) => {
    // Check if we're editing an existing mission
    if (missions.some(m => m.id === mission.id)) {
      // Update existing mission
      setMissions(prevMissions => 
        prevMissions.map(m => m.id === mission.id ? mission : m)
      );
    } else {
      // Add new mission
      setMissions(prevMissions => [...prevMissions, mission]);
    }
    
    // Close form
    setIsFormOpen(false);
    setEditingMission(null);
  };
  
  // Handle cancel mission form
  const handleCancelMissionForm = () => {
    setIsFormOpen(false);
    setEditingMission(null);
  };
  
  // Handle delete mission
  const handleDeleteMission = (missionId: string) => {
    // No role check for deletion - all users can delete
    if (confirm('Are you sure you want to delete this mission? This action cannot be undone.')) {
      setMissions(prevMissions => prevMissions.filter(m => m.id !== missionId));
      setIsFormOpen(false);
      setEditingMission(null);
    }
  };
  
  // Page animations
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  // Auth/loading states
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mg-text text-center">
          <div className="mg-loader"></div>
          <p className="mt-4">Loading Mission Planner...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mg-text text-center">
          <p>Access denied. Please log in to view this page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen p-4 md:p-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div className="mb-6" variants={itemVariants}>
        <h1 className="mg-title text-2xl md:text-3xl font-quantify tracking-wider">MISSION COMMAND</h1>
        <p className="mg-text text-sm opacity-80">
          Plan, schedule and manage AydoCorp fleet operations
        </p>
      </motion.div>
      
      {/* Main Content Panel */}
      <motion.div variants={itemVariants}>
        <MobiGlasPanel 
          title="MISSION PLANNER" 
          accentColor="primary"
          rightContent={
            <button 
              className="mg-button py-1.5 px-4 text-sm font-quantify tracking-wider relative group overflow-hidden"
              onClick={handleCreateMission}
            >
              <span className="relative z-10">CREATE MISSION</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="radar-sweep"></div>
              </div>
            </button>
          }
        >
          <div className="h-full flex flex-col">
            {/* Filters & Controls */}
            <div className="mb-4">
              <MissionFilters 
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
            </div>
            
            {/* Mission List */}
            <div className="flex-grow">
              <MissionList 
                missions={filteredMissions}
                loading={loading}
                error={error}
                onMissionClick={handleMissionClick}
              />
            </div>
          </div>
        </MobiGlasPanel>
      </motion.div>
      
      {/* Mission Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <MissionForm 
            mission={editingMission || undefined}
            onSave={handleSaveMission}
            onCancel={handleCancelMissionForm}
            onDelete={handleDeleteMission}
          />
        )}
      </AnimatePresence>
      
      {/* Floating Create Button (Mobile) */}
      <motion.button
        className="fixed bottom-8 right-8 z-30 w-14 h-14 rounded-full bg-[rgba(var(--mg-primary),0.9)] shadow-lg flex items-center justify-center group"
        onClick={handleCreateMission}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="absolute right-full mr-3 bg-[rgba(var(--mg-panel-dark),0.9)] border border-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.9)] px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Create New Mission</span>
      </motion.button>
    </motion.div>
  );
} 