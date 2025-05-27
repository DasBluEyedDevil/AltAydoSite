'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import MobiGlasPanel from '@/components/dashboard/MobiGlasPanel';
import MissionList from '@/components/fleet-ops/mission-planner/MissionList';
import MissionFilters from '@/components/fleet-ops/mission-planner/MissionFilters';
import MissionForm from '@/components/fleet-ops/mission-planner/MissionForm';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';

// Mission data will be fetched from the API

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

  // Fetch missions from API
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch missions from the API
        const response = await fetch('/api/fleet-ops/missions');

        if (!response.ok) {
          throw new Error(`Error fetching missions: ${response.status}`);
        }

        const data = await response.json();
        setMissions(data);
        setLoading(false);

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
  const handleSaveMission = async (mission: MissionResponse) => {
    try {
      setLoading(true);

      // Check if we're editing an existing mission
      if (missions.some(m => m.id === mission.id)) {
        // Update existing mission via API
        const response = await fetch('/api/fleet-ops/missions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mission)
        });

        if (!response.ok) {
          throw new Error(`Error updating mission: ${response.status}`);
        }

        const updatedMission = await response.json();

        // Update local state
        setMissions(prevMissions => 
          prevMissions.map(m => m.id === mission.id ? updatedMission : m)
        );
      } else {
        // Create new mission via API
        const response = await fetch('/api/fleet-ops/missions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mission)
        });

        if (!response.ok) {
          throw new Error(`Error creating mission: ${response.status}`);
        }

        const newMission = await response.json();

        // Add to local state
        setMissions(prevMissions => [...prevMissions, newMission]);
      }

      // Close form
      setIsFormOpen(false);
      setEditingMission(null);
      setLoading(false);
    } catch (error) {
      console.error('Error saving mission:', error);
      setError('Failed to save mission');
      setLoading(false);
    }
  };

  // Handle cancel mission form
  const handleCancelMissionForm = () => {
    setIsFormOpen(false);
    setEditingMission(null);
  };

  // Handle delete mission
  const handleDeleteMission = async (missionId: string) => {
    // No role check for deletion - all users can delete
    if (confirm('Are you sure you want to delete this mission? This action cannot be undone.')) {
      try {
        setLoading(true);

        // Delete mission via API
        const response = await fetch(`/api/fleet-ops/missions?id=${missionId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`Error deleting mission: ${response.status}`);
        }

        // Update local state
        setMissions(prevMissions => prevMissions.filter(m => m.id !== missionId));
        setIsFormOpen(false);
        setEditingMission(null);
        setLoading(false);
      } catch (error) {
        console.error('Error deleting mission:', error);
        setError('Failed to delete mission');
        setLoading(false);
      }
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
