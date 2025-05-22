import React from 'react';
import { OperationResponse } from '@/types/Operation';

interface OperationCardProps {
  operation: OperationResponse;
  onClick: () => void;
}

const OperationCard: React.FC<OperationCardProps> = ({ operation, onClick }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-[rgba(59,130,246,0.15)] text-[rgba(96,165,250,0.9)] border-[rgba(59,130,246,0.3)]';
      case 'Briefing':
        return 'bg-[rgba(124,58,237,0.15)] text-[rgba(167,139,250,0.9)] border-[rgba(124,58,237,0.3)]';
      case 'Active':
        return 'bg-[rgba(16,185,129,0.15)] text-[rgba(52,211,153,0.9)] border-[rgba(16,185,129,0.3)]';
      case 'Completed':
        return 'bg-[rgba(20,184,166,0.15)] text-[rgba(45,212,191,0.9)] border-[rgba(20,184,166,0.3)]';
      case 'Debriefing':
        return 'bg-[rgba(249,115,22,0.15)] text-[rgba(251,146,60,0.9)] border-[rgba(249,115,22,0.3)]';
      case 'Cancelled':
        return 'bg-[rgba(239,68,68,0.15)] text-[rgba(248,113,113,0.9)] border-[rgba(239,68,68,0.3)]';
      default:
        return 'bg-[rgba(107,114,128,0.15)] text-[rgba(156,163,175,0.9)] border-[rgba(107,114,128,0.3)]';
    }
  };
  
  return (
    <div 
      className="mg-panel bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm p-4 cursor-pointer hover:border-[rgba(var(--mg-primary),0.4)] transition-all relative group"
      onClick={onClick}
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
      
      <div className="flex justify-between items-start mb-3">
        <h3 className="mg-title text-lg truncate flex-1 font-quantify tracking-wide">{operation.name}</h3>
        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(operation.status)} ml-2`}>
          {operation.status}
        </span>
      </div>
      
      <p className="mg-text-secondary text-sm mb-4 line-clamp-2 opacity-80">{operation.description}</p>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="mg-text-secondary">{formatDate(operation.plannedDateTime)}</span>
        </div>
        
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="mg-text-secondary truncate">{operation.location}</span>
        </div>
        
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="mg-text-secondary">Led by {operation.leaderName || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="mg-text-secondary">{operation.participants.length} participants</span>
        </div>
      </div>
    </div>
  );
};

export default OperationCard; 