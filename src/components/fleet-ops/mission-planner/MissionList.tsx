import React from 'react';
import { motion } from 'framer-motion';
import { MissionResponse } from '@/types/Mission';
import MissionCard from './MissionCard';

interface MissionListProps {
  missions: MissionResponse[];
  onMissionClick: (mission: MissionResponse) => void;
  loading?: boolean;
  error?: string | null;
}

const MissionList: React.FC<MissionListProps> = ({ 
  missions, 
  onMissionClick, 
  loading = false, 
  error = null 
}) => {
  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  // Empty state
  if (missions.length === 0 && !loading && !error) {
    return (
      <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[rgba(var(--mg-primary),0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mg-text-secondary mt-4">No missions currently available.</p>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="mg-loader mx-auto"></div>
        <p className="mg-text mt-4">Loading missions...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="mg-panel-error p-4 rounded-sm border border-[rgba(var(--mg-error),0.3)] bg-[rgba(var(--mg-error),0.1)]">
        <p className="mg-text-error">{error}</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {missions.map(mission => (
        <MissionCard 
          key={mission.id} 
          mission={mission} 
          onClick={() => onMissionClick(mission)} 
        />
      ))}
    </motion.div>
  );
};

export default MissionList; 