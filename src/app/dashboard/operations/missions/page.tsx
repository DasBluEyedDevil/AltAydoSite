'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';

// New Mission Planner Components
import MissionDashboard from '@/components/fleet-ops/mission-planner/MissionDashboard';
import MissionDetail from '@/components/fleet-ops/mission-planner/MissionDetail';
import MissionForm from '@/components/fleet-ops/mission-planner/MissionForm';
import LoadingOverlay from '@/components/LoadingOverlay';
import ErrorNotification from '@/components/ErrorNotification';

export default function MissionPlannerPage() {
  const { data: session, status } = useSession();
  const [missions, setMissions] = useState<MissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<MissionResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<MissionResponse | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');

  // Simulate system initialization effect
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch missions from API
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/fleet-ops/missions');

        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(`Error fetching missions: ${errorData.error || response.status}`);
          } catch (jsonError) {
            throw new Error(`Error fetching missions: ${response.status}`);
          }
        }

        const data = await response.json();
        setMissions(data);
        setLoading(false);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch missions';
        setError(errorMessage);
        setLoading(false);
        console.error('Error fetching missions:', err);
      }
    };

    fetchMissions();
  }, []);

  // Handle mission click
  const handleMissionClick = (mission: MissionResponse) => {
    setError(null);
    setSelectedMission(mission);
    setViewMode('detail');
  };

  // Handle create new mission
  const handleCreateMission = () => {
    setError(null);
    setEditingMission(null);
    setViewMode('form');
  };

  // Handle edit mission
  const handleEditMission = (mission: MissionResponse) => {
    setError(null);
    setEditingMission(mission);
    setViewMode('form');
  };

  // Handle save mission
  const handleSaveMission = async (mission: MissionResponse) => {
    try {
      setError(null);
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
          const errorData = await response.json();
          throw new Error(errorData.error || `Error updating mission: ${response.status}`);
        }

        const updatedMission = await response.json();

        // Update local state
        setMissions(prevMissions => 
          prevMissions.map(m => m.id === mission.id ? updatedMission : m)
        );
        
        setSelectedMission(updatedMission);
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
          const errorData = await response.json();
          throw new Error(errorData.error || `Error creating mission: ${response.status}`);
        }

        const newMission = await response.json();

        // Add to local state
        setMissions(prevMissions => [...prevMissions, newMission]);
        setSelectedMission(newMission);
      }

      // Return to detail view
      setViewMode('detail');
      setEditingMission(null);
      setLoading(false);
    } catch (error: any) {
      console.error('Error saving mission:', error);
      
      let errorMessage = 'Failed to save mission';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // If the error contains "Database connection", show a more helpful message
      if (errorMessage.includes('Database connection')) {
        errorMessage = 'Failed to connect to the database. Please check your connection and try again.';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  // Handle delete mission
  const handleDeleteMission = async (missionId: string) => {
    if (confirm('Are you sure you want to delete this mission? This action cannot be undone.')) {
      try {
        setError(null);
        setLoading(true);

        const response = await fetch(`/api/fleet-ops/missions?id=${missionId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`Error deleting mission: ${response.status}`);
        }

        setMissions(prevMissions => prevMissions.filter(m => m.id !== missionId));
        setViewMode('list');
        setSelectedMission(null);
        setLoading(false);
      } catch (error: any) {
        console.error('Error deleting mission:', error);
        
        let errorMessage = 'Failed to delete mission';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        setLoading(false);
      }
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (viewMode === 'detail') {
      setViewMode('list');
      setSelectedMission(null);
    } else if (viewMode === 'form') {
      if (editingMission) {
        setViewMode('detail');
      } else {
        setViewMode('list');
      }
      setEditingMission(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Initialization Overlay */}
      <AnimatePresence>
        {!isInitialized && (
          <LoadingOverlay text="Initializing Mission Planner" />
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <ErrorNotification
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div
            key="mission-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto p-4"
          >
            <MissionDashboard
              missions={missions}
              loading={loading}
              onMissionClick={handleMissionClick}
              onCreateMission={handleCreateMission}
            />
          </motion.div>
        )}
        
        {viewMode === 'detail' && selectedMission && (
          <motion.div
            key="mission-detail"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto p-4"
          >
            <MissionDetail
              mission={selectedMission}
              onBack={handleBack}
              onEdit={() => handleEditMission(selectedMission)}
              onDelete={() => handleDeleteMission(selectedMission.id)}
            />
          </motion.div>
        )}
        
        {viewMode === 'form' && (
          <motion.div
            key="mission-form"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto p-4"
          >
            <MissionForm
              mission={editingMission}
              onSave={handleSaveMission}
              onCancel={handleBack}
              onDelete={editingMission ? () => handleDeleteMission(editingMission.id) : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
