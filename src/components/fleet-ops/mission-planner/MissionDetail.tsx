import React from 'react';
import { motion } from 'framer-motion';
import { MissionResponse } from '@/types/Mission';
import Image from 'next/image';

interface MissionDetailProps {
  mission: MissionResponse;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MissionDetail: React.FC<MissionDetailProps> = ({
  mission,
  onBack,
  onEdit,
  onDelete
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }).format(date);
  };

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
      transition: { duration: 0.4 }
    }
  };

  // Mission status styling
  const getStatusColor = (status: string) => {
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
      {/* Header with back button */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="mg-button-secondary p-2 rounded-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="mg-title text-3xl font-quantify tracking-wider flex-grow">MISSION DETAILS</h1>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="mg-button-secondary py-2 px-4 text-sm font-quantify tracking-wider"
          >
            EDIT
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="mg-button-error py-2 px-4 text-sm font-quantify tracking-wider"
          >
            DELETE
          </motion.button>
        </div>
      </motion.div>

      {/* Mission Overview Panel */}
      <motion.div 
        variants={itemVariants}
        className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm p-6 relative overflow-hidden"
      >
        {/* Corner decorations */}
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

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Mission info */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <h2 className="mg-title text-2xl">{mission.name}</h2>
              <span className={`text-sm px-3 py-1.5 rounded-sm border ${getStatusColor(mission.status)}`}>
                {mission.status}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-[rgba(var(--mg-primary),0.7)] mb-1">Mission Type</h3>
                <p className="mg-text">{mission.type}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-[rgba(var(--mg-primary),0.7)] mb-1">Scheduled Date & Time</h3>
                <p className="mg-text">{formatDate(mission.scheduledDateTime)}</p>
              </div>
              
              {mission.location && (
                <div>
                  <h3 className="text-sm text-[rgba(var(--mg-primary),0.7)] mb-1">Location</h3>
                  <p className="mg-text">{mission.location}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm text-[rgba(var(--mg-primary),0.7)] mb-1">Mission Details</h3>
                <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] p-3 border border-[rgba(var(--mg-primary),0.1)] rounded-sm">
                  <p className="mg-text whitespace-pre-wrap">{mission.details || 'No details provided.'}</p>
                </div>
              </div>
              
              {mission.images && mission.images.length > 0 && (
                <div>
                  <h3 className="text-sm text-[rgba(var(--mg-primary),0.7)] mb-2">Mission Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mission.images.map((imageUrl, index) => (
                      <div key={index} className="aspect-video relative group overflow-hidden border border-[rgba(var(--mg-primary),0.2)] rounded-sm">
                        <Image
                          src={imageUrl}
                          alt={`Mission image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                          <span className="p-2 text-xs text-white">Image {index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Participants */}
          <div className="w-full md:w-96">
            <h3 className="text-sm text-[rgba(var(--mg-primary),0.7)] mb-3">Mission Roster</h3>
            
            {mission.participants.length === 0 ? (
              <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] p-3 border border-[rgba(var(--mg-primary),0.1)] rounded-sm text-center py-6">
                <p className="mg-text-secondary text-sm">No personnel assigned to this mission</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mission.participants.map((participant) => (
                  <div 
                    key={participant.userId}
                    className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] p-3 border border-[rgba(var(--mg-primary),0.1)] rounded-sm relative group overflow-hidden"
                  >
                    {/* Hover effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
                      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] flex items-center justify-center text-base flex-shrink-0">
                        {participant.userName.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="mg-text font-semibold truncate">{participant.userName}</p>
                        
                        {participant.roles && participant.roles.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {participant.roles.map((role, index) => (
                              <span 
                                key={index}
                                className="inline-block text-xs px-2 py-0.5 bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {participant.shipId && (
                          <div className="mt-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-primary),0.6)] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-xs text-[rgba(var(--mg-primary),0.7)]">
                              {participant.shipName} ({participant.shipType})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MissionDetail; 