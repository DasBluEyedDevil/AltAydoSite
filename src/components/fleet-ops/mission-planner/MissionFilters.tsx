import React from 'react';
import { motion } from 'framer-motion';
import { MissionStatus, MissionType } from '@/types/Mission';

interface MissionFiltersProps {
  statusFilter: MissionStatus | 'all';
  setStatusFilter: (status: MissionStatus | 'all') => void;
  typeFilter: MissionType | 'all';
  setTypeFilter: (type: MissionType | 'all') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const MissionFilters: React.FC<MissionFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sortOrder,
  setSortOrder
}) => {
  // Animation for container
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };
  
  // Animation for filter items
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="flex flex-col md:flex-row gap-3 mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Status</label>
        <div className="relative">
          <select 
            className="mg-input text-sm py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none min-w-[160px] appearance-none pr-8"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MissionStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Briefing">Briefing</option>
            <option value="In Progress">In Progress</option>
            <option value="Debriefing">Debriefing</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Mission Type</label>
        <div className="relative">
          <select 
            className="mg-input text-sm py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none min-w-[180px] appearance-none pr-8"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MissionType | 'all')}
          >
            <option value="all">All Types</option>
            <option value="Cargo Haul">Cargo Haul</option>
            <option value="Salvage Operation">Salvage Operation</option>
            <option value="Bounty Hunting">Bounty Hunting</option>
            <option value="Exploration">Exploration</option>
            <option value="Reconnaissance">Reconnaissance</option>
            <option value="Medical Support">Medical Support</option>
            <option value="Combat Patrol">Combat Patrol</option>
            <option value="Escort Duty">Escort Duty</option>
            <option value="Mining Expedition">Mining Expedition</option>
          </select>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Sort by Date</label>
        <div className="flex">
          <button 
            className={`mg-button-small py-1.5 px-3 text-xs font-quantify border border-r-0 rounded-l-sm rounded-r-none ${
              sortOrder === 'asc' 
                ? 'border-[rgba(var(--mg-primary),0.5)] bg-[rgba(var(--mg-primary),0.1)]' 
                : 'border-[rgba(var(--mg-primary),0.25)]'
            }`}
            onClick={() => setSortOrder('asc')}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Oldest First
            </span>
          </button>
          <button 
            className={`mg-button-small py-1.5 px-3 text-xs font-quantify border border-l-0 rounded-r-sm rounded-l-none ${
              sortOrder === 'desc' 
                ? 'border-[rgba(var(--mg-primary),0.5)] bg-[rgba(var(--mg-primary),0.1)]' 
                : 'border-[rgba(var(--mg-primary),0.25)]'
            }`}
            onClick={() => setSortOrder('desc')}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Newest First
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MissionFilters; 