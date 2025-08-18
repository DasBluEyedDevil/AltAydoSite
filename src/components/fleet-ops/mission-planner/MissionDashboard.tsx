import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';
import MissionList from './MissionList';
import MissionFilters from './MissionFilters';
import HolographicButton from './HolographicButton';

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
  const [isCreateButtonHovered, setIsCreateButtonHovered] = useState(false);
  
  // Ensure missions is always an array before filtering
  const missionArray = Array.isArray(missions) ? missions : [];

  // Filter and sort missions
  const filteredMissions = missionArray
    .filter(mission => 
      (statusFilter === 'all' || mission.status === statusFilter) &&
      (typeFilter === 'all' || mission.type === typeFilter)
    )
    .sort((a, b) => {
      const dateA = new Date(a.scheduledDateTime).getTime();
      const dateB = new Date(b.scheduledDateTime).getTime();
      
      if (sortOrder === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  
  // Animation variants
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      {/* Header with title and create button */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4"
      >
        <div>
          <h1 className="mg-title text-lg md:text-xl font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)]">
            MISSION DATABASE
          </h1>
          <p className="mg-text-secondary text-sm mt-1 opacity-70 ml-1">
            Manage operations and assign personnel
          </p>
        </div>

        <motion.div
          onHoverStart={() => setIsCreateButtonHovered(true)}
          onHoverEnd={() => setIsCreateButtonHovered(false)}
          className="relative"
        >
          {/* Enhanced create button with animated elements */}
          <HolographicButton
            onClick={onCreateMission}
            variant="primary"
            icon={
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={isCreateButtonHovered ? {
                  rotate: [0, 90, 180, 270, 360],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ duration: 0.8 }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </motion.svg>
            }
          >
            CREATE MISSION
          </HolographicButton>
          
          {/* Animated rings around the button when hovered */}
          <AnimatePresence>
            {isCreateButtonHovered && (
              <motion.div
                className="absolute -inset-2 -z-10 rounded-md pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="absolute inset-0 rounded-md border border-[rgba(var(--mg-primary),0.4)]"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 #00000000",
                      "0 0 10px 2px #3f7eaa4d",
                      "0 0 0 0 #00000000"
                    ],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                
                {/* Data points around the button */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.7)]"
                    style={{ 
                      top: `${50 + 35 * Math.sin(i * Math.PI / 3)}%`,
                      left: `${50 + 35 * Math.cos(i * Math.PI / 3)}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    animate={{ 
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <MissionFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </motion.div>

      {/* Mission List */}
      <motion.div 
        variants={itemVariants}
        className="relative"
      >
        {/* Scanning effect across the list */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.6)] to-transparent"
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 5
            }}
          />
        </motion.div>

        <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.15)] p-6 relative overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-0 right-0 w-[20px] h-[20px]">
            <div className="absolute top-0 right-0 w-[2px] h-[10px] bg-[rgba(var(--mg-primary),0.4)]"></div>
            <div className="absolute top-0 right-0 w-[10px] h-[2px] bg-[rgba(var(--mg-primary),0.4)]"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-[20px] h-[20px]">
            <div className="absolute bottom-0 left-0 w-[2px] h-[10px] bg-[rgba(var(--mg-primary),0.4)]"></div>
            <div className="absolute bottom-0 left-0 w-[10px] h-[2px] bg-[rgba(var(--mg-primary),0.4)]"></div>
          </div>
          
          {/* Hexagon background pattern */}
          <div className="hexagon-bg absolute inset-0 opacity-10 pointer-events-none"></div>

          {/* Grid background */}
          <div className="mg-grid-bg"></div>

          {/* Floating data indicators */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={`data-indicator-${i}`}
                className="absolute w-1 h-1 rounded-full bg-[rgba(var(--mg-primary),0.7)]"
                style={{ 
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          <MissionList
            missions={filteredMissions}
            onMissionClick={onMissionClick}
            loading={loading}
          />

          {/* Empty state */}
          {!loading && filteredMissions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 mb-4 relative">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[rgba(var(--mg-primary),0.3)]"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 #00000000",
                      "0 0 0 10px #3f7eaa1a",
                      "0 0 0 20px #00000000"
                    ]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
                <svg
                  className="w-full h-full text-[rgba(var(--mg-primary),0.6)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="mg-text text-lg mb-2 font-quantify tracking-wider">No Missions Found</p>
              <p className="mg-text-secondary text-sm opacity-70 max-w-md">
                {statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'Create your first mission to get started with operations planning'}
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mt-6 relative"
              >
                <HolographicButton
                  onClick={onCreateMission}
                  icon={
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      animate={{ 
                        rotate: [0, 0, 180, 180, 0],
                        scale: [1, 1.2, 1.2, 1, 1]
                      }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4" 
                      />
                    </motion.svg>
                  }
                >
                  CREATE NEW MISSION
                </HolographicButton>
                
                {/* Animated pulsing effect around the button */}
                <motion.div
                  className="absolute -inset-2 -z-10 rounded-md pointer-events-none"
                >
                  <motion.div 
                    className="absolute inset-0 rounded-md border border-[rgba(var(--mg-primary),0.4)]"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 #00000000",
                        "0 0 15px 3px #3f7eaa4d",
                        "0 0 0 0 #00000000"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MissionDashboard; 