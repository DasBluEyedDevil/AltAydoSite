import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';
import MissionBasicInfoForm from './MissionBasicInfoForm';
import MissionPersonnelForm from './MissionPersonnelForm';

interface MissionFormProps {
  mission?: MissionResponse;
  onSave: (mission: MissionResponse) => void;
  onCancel: () => void;
  onDelete?: (missionId: string) => void;
}

const MissionForm: React.FC<MissionFormProps> = ({ mission, onSave, onCancel, onDelete }) => {
  // Form section state
  const [activeSection, setActiveSection] = useState<'basic' | 'personnel'>('basic');

  // Form data
  const [formData, setFormData] = useState<Partial<MissionResponse>>({
    name: '',
    type: 'Cargo Haul',
    scheduledDateTime: new Date().toISOString(),
    status: 'Planning',
    briefSummary: '',
    details: '',
    location: '',
    images: [],
    participants: [],
  });

  // Initialize form with mission data if editing
  useEffect(() => {
    if (mission) {
      setFormData(mission);
    }
  }, [mission]);

  // Preserve form data when switching tabs
  const handleTabChange = (tab: 'basic' | 'personnel') => {
    // Save current state before switching tabs
    setActiveSection(tab);
  };

  // Update form data
  const updateFormData = (key: keyof MissionResponse, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.type || !formData.scheduledDateTime) {
      // Show validation error
      return;
    }

    // In a real implementation, this would send data to an API
    const missionData = {
      id: mission?.id || `mission-${Date.now()}`,
      name: formData.name!,
      type: formData.type as MissionType,
      scheduledDateTime: formData.scheduledDateTime!,
      status: formData.status as MissionStatus,
      briefSummary: formData.briefSummary || '',
      details: formData.details || '',
      location: formData.location,
      leaderId: formData.leaderId,
      leaderName: formData.leaderName,
      images: formData.images || [],
      participants: formData.participants || [],
      createdAt: mission?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(missionData as MissionResponse);
  };

  // Handle mission deletion
  const handleDeleteMission = () => {
    if (mission && onDelete) {
      onDelete(mission.id);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="mg-panel bg-[rgba(var(--mg-panel-dark),0.8)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm overflow-hidden max-w-4xl mx-auto"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Form Header */}
      <div className="px-6 py-4 border-b border-[rgba(var(--mg-primary),0.2)] flex justify-between items-center sticky top-0 z-10 bg-[rgba(var(--mg-panel-dark),0.95)] backdrop-blur-sm">
        <h2 className="mg-title text-xl font-quantify tracking-wider">
          {mission ? 'EDIT MISSION' : 'CREATE NEW MISSION'}
        </h2>

        <button 
          className="mg-button-cancel p-1.5 rounded-sm"
          onClick={onCancel}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Navigation */}
      <div className="flex border-b border-[rgba(var(--mg-primary),0.2)] sticky top-[57px] z-10 bg-[rgba(var(--mg-panel-dark),0.95)] backdrop-blur-sm">
        <button
          className={`py-3 px-6 font-quantify text-sm tracking-wider relative ${
            activeSection === 'basic' ? 'text-[rgba(var(--mg-primary),1)]' : 'text-[rgba(var(--mg-primary),0.6)]'
          }`}
          onClick={() => handleTabChange('basic')}
        >
          MISSION DETAILS
          {activeSection === 'basic' && (
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgba(var(--mg-primary),1)]"
              layoutId="activeTab"
            />
          )}
        </button>

        <button
          className={`py-3 px-6 font-quantify text-sm tracking-wider relative ${
            activeSection === 'personnel' ? 'text-[rgba(var(--mg-primary),1)]' : 'text-[rgba(var(--mg-primary),0.6)]'
          }`}
          onClick={() => handleTabChange('personnel')}
        >
          PERSONNEL & ASSETS
          {activeSection === 'personnel' && (
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgba(var(--mg-primary),1)]"
              layoutId="activeTab"
            />
          )}
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="max-h-[calc(90vh-200px)] overflow-y-auto">
        <div className="p-6">
          {activeSection === 'basic' ? (
            <MissionBasicInfoForm 
              formData={formData}
              updateFormData={updateFormData}
            />
          ) : (
            <MissionPersonnelForm 
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 border-t border-[rgba(var(--mg-primary),0.2)] flex justify-between sticky bottom-0 bg-[rgba(var(--mg-panel-dark),0.95)] backdrop-blur-sm">
          <div className="flex space-x-3">
            <button
              type="button"
              className="mg-button-secondary py-2 px-6 text-sm font-quantify tracking-wider"
              onClick={onCancel}
            >
              CANCEL
            </button>

            {mission && onDelete && (
              <button
                type="button"
                className="mg-button-error py-2 px-6 text-sm font-quantify tracking-wider"
                onClick={handleDeleteMission}
              >
                DELETE MISSION
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {activeSection === 'personnel' && (
              <button
                type="button"
                className="mg-button-outline py-2 px-6 text-sm font-quantify tracking-wider"
                onClick={() => handleTabChange('basic')}
              >
                PREVIOUS
              </button>
            )}

            {activeSection === 'basic' ? (
              <button
                type="button"
                className="mg-button py-2 px-6 text-sm font-quantify tracking-wider"
                onClick={() => handleTabChange('personnel')}
              >
                NEXT
              </button>
            ) : (
              <button
                type="submit"
                className="mg-button py-2 px-6 text-sm font-quantify tracking-wider relative group overflow-hidden"
              >
                <span className="relative z-10">{mission ? 'UPDATE MISSION' : 'CREATE MISSION'}</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="radar-sweep"></div>
                </div>
              </button>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default MissionForm; 
