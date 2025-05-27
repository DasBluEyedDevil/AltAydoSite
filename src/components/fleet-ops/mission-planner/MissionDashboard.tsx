import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';

interface MissionDashboardProps {
  missions: MissionResponse[];
  loading: boolean;
  onMissionClick: (mission: MissionResponse) => void;
  onCreateMission: () => void;
}

const MissionDashboard: React.FC<MissionDashboardProps> = ({
  missions,
  loading,
  onMissionClick,
  onCreateMission
}) => {
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MissionType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort missions
  const filteredMissions = missions
    .filter(mission => {
      if (statusFilter !== 'all' && mission.status !== statusFilter) return false;
      if (typeFilter !== 'all' && mission.type !== typeFilter) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          mission.name.toLowerCase().includes(searchLower) ||
          mission.location?.toLowerCase().includes(searchLower) ||
          mission.details.toLowerCase().includes(searchLower) ||
          mission.participants.some(p => p.userName.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.scheduledDateTime).getTime();
      const dateB = new Date(b.scheduledDateTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Dashboard animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Mission status styling
  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'Planning':
        return 'border-blue-400 text-blue-400 bg-[rgba(59,130,246,0.1)]';
      case 'Briefing':
        return 'border-purple-400 text-purple-400 bg-[rgba(167,139,250,0.1)]';
      case 'In Progress':
        return 'border-green-400 text-green-400 bg-[rgba(74,222,128,0.1)]';
      case 'Completed':
        return 'border-gray-400 text-gray-400 bg-[rgba(156,163,175,0.1)]';
      case 'Archived':
        return 'border-gray-500 text-gray-500 bg-[rgba(107,114,128,0.1)]';
      case 'Cancelled':
        return 'border-red-400 text-red-400 bg-[rgba(248,113,113,0.1)]';
      default:
        return 'border-[rgba(var(--mg-primary),0.5)] text-[rgba(var(--mg-primary),0.8)] bg-[rgba(var(--mg-primary),0.1)]';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col space-y-6"
    >
      {/* Dashboard Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="mg-title text-3xl font-quantify tracking-wider">MISSION COMMAND</h1>
          <p className="mg-text-secondary text-sm">Plan, manage and execute AydoCorp fleet operations</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateMission}
          className="mg-button py-2 px-6 text-sm font-quantify tracking-wider relative group overflow-hidden"
        >
          <span className="relative z-10">CREATE MISSION</span>
          {/* Animated background effect */}
          <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-[rgba(var(--mg-primary),0.15)]"></div>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: ['-100%', '100%'] }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "linear"
              }}
              className="absolute inset-x-0 h-[8px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.3)] to-transparent"
            />
          </div>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mg-panel bg-[rgba(var(--mg-panel-dark),0.5)] p-4 border border-[rgba(var(--mg-primary),0.15)] rounded-sm relative overflow-hidden">
        {/* Panel decorations */}
        <div className="absolute top-0 right-0 w-[20px] h-[20px]">
          <div className="absolute top-0 right-0 w-[2px] h-[10px] bg-[rgba(var(--mg-primary),0.4)]"></div>
          <div className="absolute top-0 right-0 w-[10px] h-[2px] bg-[rgba(var(--mg-primary),0.4)]"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-[20px] h-[20px]">
          <div className="absolute bottom-0 left-0 w-[2px] h-[10px] bg-[rgba(var(--mg-primary),0.4)]"></div>
          <div className="absolute bottom-0 left-0 w-[10px] h-[2px] bg-[rgba(var(--mg-primary),0.4)]"></div>
        </div>
        
        {/* Scanning line effect */}
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: '100%' }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "linear"
          }}
          className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent pointer-events-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search missions..."
                className="mg-input text-sm py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none w-full pr-8"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-primary),0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Status filter */}
          <div>
            <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as MissionStatus | 'all')}
                className="mg-input text-sm py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none w-full appearance-none pr-8"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-primary),0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Type filter */}
          <div>
            <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Type</label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as MissionType | 'all')}
                className="mg-input text-sm py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none w-full appearance-none pr-8"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-primary),0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Sort Order */}
          <div>
            <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Sort By Date</label>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="mg-input text-sm py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none w-full appearance-none pr-8"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-primary),0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mission Grid */}
      <motion.div variants={itemVariants} className="flex-grow">
        {loading ? (
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.5)] p-8 border border-[rgba(var(--mg-primary),0.15)] rounded-sm flex justify-center items-center">
            <div className="mg-loader"></div>
            <span className="ml-4 mg-text-secondary">Loading missions...</span>
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.5)] p-8 border border-[rgba(var(--mg-primary),0.15)] rounded-sm text-center">
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[rgba(var(--mg-primary),0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mg-text-secondary mt-4">No missions found. Create a new mission to get started.</p>
              <button 
                onClick={onCreateMission}
                className="mg-button-secondary mt-4 py-2 px-4 text-sm"
              >
                Create Mission
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMissions.map((mission) => (
              <motion.div
                key={mission.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onMissionClick(mission)}
                className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm p-4 cursor-pointer hover:border-[rgba(var(--mg-primary),0.4)] transition-all relative group"
              >
                {/* Top right corner decoration */}
                <div className="absolute top-0 right-0 w-[20px] h-[20px]">
                  <div className="absolute top-0 right-0 w-[2px] h-[10px] bg-[rgba(var(--mg-primary),0.4)]"></div>
                  <div className="absolute top-0 right-0 w-[10px] h-[2px] bg-[rgba(var(--mg-primary),0.4)]"></div>
                </div>
                
                {/* Bottom left corner decoration */}
                <div className="absolute bottom-0 left-0 w-[20px] h-[20px]">
                  <div className="absolute bottom-0 left-0 w-[2px] h-[10px] bg-[rgba(var(--mg-primary),0.4)]"></div>
                  <div className="absolute bottom-0 left-0 w-[10px] h-[2px] bg-[rgba(var(--mg-primary),0.4)]"></div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="mg-title text-lg truncate flex-1">{mission.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-sm border ${getStatusColor(mission.status)} ml-2 whitespace-nowrap`}>
                    {mission.status}
                  </span>
                </div>
                
                <div className="text-sm mb-2 flex items-center text-[rgba(var(--mg-primary),0.7)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(mission.scheduledDateTime)}
                </div>
                
                {mission.location && (
                  <div className="text-sm mb-2 flex items-center text-[rgba(var(--mg-primary),0.7)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {mission.location}
                  </div>
                )}
                
                <div className="mt-3 flex items-center">
                  <div className="text-sm text-[rgba(var(--mg-primary),0.7)] mr-2">
                    {mission.type}
                  </div>
                  
                  <div className="ml-auto flex -space-x-2">
                    {mission.participants.slice(0, 3).map((participant, index) => (
                      <div 
                        key={participant.userId + index}
                        className="w-6 h-6 rounded-full bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] flex items-center justify-center text-xs"
                        title={participant.userName}
                      >
                        {participant.userName.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {mission.participants.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] flex items-center justify-center text-xs">
                        +{mission.participants.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MissionDashboard; 