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
import HoloModal from '@/components/fleet-ops/mission-planner/HoloModal';

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
  
  // New state for modal controls
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<string | null>(null);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  // System message effect
  useEffect(() => {
    if (systemMessage) {
      const timer = setTimeout(() => {
        setSystemMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [systemMessage]);

  // Simulate system initialization effect
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch missions
  useEffect(() => {
    const fetchMissions = async () => {
      if (status !== 'authenticated') return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/fleet-ops/missions');
        
        if (!response.ok) {
          throw new Error(`Error fetching missions: ${response.status}`);
        }
        
        const data = await response.json();
        setMissions(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    fetchMissions();
  }, [status]);

  // Handle mission click
  const handleMissionClick = (mission: MissionResponse) => {
    setSelectedMission(mission);
    setShowDetailModal(true);
  };

  // Handle back button click
  const handleBack = () => {
    setShowDetailModal(false);
    setShowFormModal(false);
    setSelectedMission(null);
    setEditingMission(null);
  };

  // Handle create mission
  const handleCreateMission = () => {
    setEditingMission(null);
    setShowFormModal(true);
  };

  // Handle edit mission
  const handleEditMission = (mission: MissionResponse) => {
    setEditingMission(mission);
    
    // Add a slight delay for a smooth transition between modals
    setTimeout(() => {
      setShowDetailModal(false);
      setTimeout(() => {
        setShowFormModal(true);
      }, 300);
    }, 100);
  };

  // Handle delete mission confirmation
  const handleConfirmDelete = (missionId: string) => {
    setMissionToDelete(missionId);
    setShowDeleteConfirmModal(true);
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
        
        // Close form modal with delay, then show success message
        setShowFormModal(false);
        setTimeout(() => {
          setSystemMessage(`Mission "${mission.name}" successfully updated`);
          // Show detail modal after a delay
          setTimeout(() => {
            setShowDetailModal(true);
          }, 500);
        }, 300);
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
        
        // Close form modal and show success message
        setShowFormModal(false);
        setTimeout(() => {
          setSystemMessage(`Mission "${mission.name}" successfully created`);
        }, 300);
      }

      setEditingMission(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  // Handle delete mission
  const handleDeleteMission = async () => {
    if (!missionToDelete) return;
    
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(`/api/fleet-ops/missions?id=${missionToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error deleting mission: ${response.status}`);
      }
      
      // Find mission name before deletion
      const deletedMission = missions.find(m => m.id === missionToDelete);
      const missionName = deletedMission?.name || 'Unknown mission';
      
      // Close modals with a nice sequence
      setShowDeleteConfirmModal(false);
      
      setTimeout(() => {
        // Update local state after modal closes
        setMissions(prevMissions => prevMissions.filter(m => m.id !== missionToDelete));
        
        setTimeout(() => {
          setShowDetailModal(false);
          setShowFormModal(false);
          setSelectedMission(null);
          setMissionToDelete(null);
          setLoading(false);
          
          // Show success message after everything is closed
          setTimeout(() => {
            setSystemMessage(`Mission "${missionName}" has been deleted`);
          }, 300);
        }, 300);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Hexagon background pattern for entire page */}
      <div className="hexagon-bg fixed inset-0 opacity-5 pointer-events-none"></div>
      
      {/* Holographic grid background */}
      <div className="fixed inset-0 bg-holo-grid bg-[length:50px_50px] opacity-5 pointer-events-none"></div>
      
      {/* Advanced scanning effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Horizontal scan line */}
        <motion.div
          className="fixed inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.7)] to-transparent pointer-events-none z-10"
          initial={{ top: '-10%' }}
          animate={{ top: '110%' }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 5
          }}
        />
        
        {/* Vertical scan line */}
        <motion.div
          className="fixed inset-y-0 w-[2px] bg-gradient-to-b from-transparent via-[rgba(var(--mg-primary),0.3)] to-transparent pointer-events-none z-10"
          initial={{ left: '-10%' }}
          animate={{ left: '110%' }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 3
          }}
        />
        
        {/* Data streams */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`data-stream-${i}`}
            className="fixed h-px bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.6)] to-transparent"
            style={{ 
              top: `${10 + (i * 10)}%`,
              width: '100%',
              opacity: 0.3,
              zIndex: 5
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8 + (i * 2),
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5
            }}
          />
        ))}
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="fixed w-1 h-1 rounded-full bg-[rgba(var(--mg-primary),0.5)]"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0
            }}
            animate={{
              opacity: [0, 0.7, 0],
              y: [0, Math.random() > 0.5 ? 100 : -100]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
      
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
      
      {/* System Message Notification */}
      <AnimatePresence>
        {systemMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md"
          >
            <div className="bg-[rgba(var(--mg-panel-dark),0.8)] border border-[rgba(var(--mg-primary),0.4)] px-4 py-3 rounded-sm relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <motion.div 
                  className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent"
                  animate={{ y: ['0%', '100%'] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Added floating particles for more visual interest */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[rgba(var(--mg-primary),0.6)]"
                    style={{ 
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                    animate={{
                      x: [0, Math.random() * 20 - 10],
                      y: [0, Math.random() * 20 - 10],
                      opacity: [0.6, 0.9, 0.6]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-3 relative z-10">
                {/* Success checkmark animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-5 h-5 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <motion.span 
                  className="mg-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {systemMessage}
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="container mx-auto p-4">
        <MissionDashboard
          missions={missions}
          loading={loading}
          onMissionClick={handleMissionClick}
          onCreateMission={handleCreateMission}
        />
      </div>
      
      {/* Mission Detail Modal */}
      <HoloModal
        isOpen={showDetailModal}
        onClose={handleBack}
        title="MISSION DETAILS"
        width="md:w-4/5 lg:w-3/4"
      >
        {selectedMission && (
          <MissionDetail
            mission={selectedMission}
            onBack={handleBack}
            onEdit={() => handleEditMission(selectedMission)}
            onDelete={() => handleConfirmDelete(selectedMission.id)}
          />
        )}
      </HoloModal>
      
      {/* Mission Form Modal */}
      <HoloModal
        isOpen={showFormModal}
        onClose={handleBack}
        title={editingMission ? "EDIT MISSION" : "CREATE MISSION"}
        width="md:w-4/5 lg:w-3/4"
      >
        <MissionForm
          mission={editingMission}
          onSave={handleSaveMission}
          onCancel={handleBack}
          onDelete={editingMission ? () => handleConfirmDelete(editingMission.id) : undefined}
        />
      </HoloModal>
      
      {/* Delete Confirmation Modal */}
      <HoloModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="CONFIRM DELETION"
        width="sm:w-[450px]"
      >
        <div className="py-4">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--mg-danger),0.1)] border border-[rgba(var(--mg-danger),0.3)] flex items-center justify-center mr-4">
              <motion.svg 
                className="w-6 h-6 text-[rgba(var(--mg-danger),0.7)]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </motion.svg>
            </div>
            <div>
              <h3 className="text-lg mg-title mb-1">Delete Mission</h3>
              <p className="text-sm mg-text-secondary">This action cannot be undone.</p>
            </div>
          </div>
          
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] border border-[rgba(var(--mg-danger),0.15)] p-4 mb-6">
            <p className="mg-text text-sm">
              Are you sure you want to delete this mission? All associated data including assignments and resources will be permanently removed.
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteConfirmModal(false)}
              className="holo-element bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.3)] py-2 px-4 text-sm font-quantify tracking-wider"
            >
              CANCEL
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(var(--mg-danger), 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteMission}
              className="holo-element bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-danger),0.4)] py-2 px-4 text-sm font-quantify tracking-wider text-[rgba(var(--mg-danger),0.9)]"
            >
              <span className="relative inline-flex items-center">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -left-2 w-1 h-1 rounded-full bg-[rgba(var(--mg-danger),0.8)]"
                />
                DELETE MISSION
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -right-2 w-1 h-1 rounded-full bg-[rgba(var(--mg-danger),0.8)]"
                />
              </span>
            </motion.button>
          </div>
        </div>
      </HoloModal>
    </div>
  );
} 
