'use client';

import { motion } from 'framer-motion';
import MobiGlasPanel from '../MobiGlasPanel';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  type: 'meeting' | 'operation' | 'training' | 'maintenance';
}

const UpcomingEventsPanel = () => {
  // Sample upcoming events
  const events: Event[] = [
    {
      id: 'evt-001',
      title: 'QUARTERLY FLEET REVIEW',
      date: '2951-08-15',
      time: '09:00',
      location: 'AYDO HQ - AREA 18',
      priority: 'high',
      type: 'meeting'
    },
    {
      id: 'evt-002',
      title: 'DEEP SPACE MINING OPERATION',
      date: '2951-08-17',
      time: '14:30',
      location: 'YELA ASTEROID BELT',
      priority: 'medium',
      type: 'operation'
    },
    {
      id: 'evt-003',
      title: 'NEW PILOT ORIENTATION',
      date: '2951-08-18',
      time: '10:00',
      location: 'TRAINING FACILITY - PORT OLISAR',
      priority: 'medium',
      type: 'training'
    },
    {
      id: 'evt-004',
      title: 'HULL-C MAINTENANCE CYCLE',
      date: '2951-08-20',
      time: '08:00',
      location: 'ENGINEERING BAY - AREA 18',
      priority: 'low',
      type: 'maintenance'
    }
  ];
  
  // Get priority color
  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'text';
      default:
        return 'text';
    }
  };
  
  // Get event type icon
  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
      case 'operation':
        return 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z';
      case 'training':
        return 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222';
      case 'maintenance':
        return 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z';
      default:
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };
  
  // Icon for the panel header
  const headerIcon = (
    <div className="w-5 h-5 relative">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),0.9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
  
  // Right content for the panel header
  const headerRight = (
    <div className="text-xs text-[rgba(var(--mg-text),0.6)]">
      <span>NEXT 7 DAYS</span>
    </div>
  );

  return (
    <MobiGlasPanel
      title="UPCOMING EVENTS"
      icon={headerIcon}
      rightContent={headerRight}
      animationDelay={0.2}
      accentColor="primary"
      corners={['tl', 'br']}
    >
      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            className="bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
          >
            {/* Event header */}
            <div className="flex items-center px-3 py-2 border-b border-[rgba(var(--mg-primary),0.1)]">
              <div className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-text),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getEventIcon(event.type)} />
                </svg>
              </div>
              <div className="flex-grow font-quantify text-sm text-[rgba(var(--mg-primary),0.9)]">{event.title}</div>
              <div className={`h-1.5 w-1.5 rounded-full bg-[rgba(var(--mg-${getPriorityColor(event.priority)}),0.7)]`}></div>
            </div>
            
            {/* Event details */}
            <div className="p-2 text-xs">
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[rgba(var(--mg-text),0.7)]">{event.date}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[rgba(var(--mg-text),0.7)]">{event.time}</span>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-3 h-3 mr-1 opacity-70">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-[rgba(var(--mg-text),0.7)]">{event.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Calendar button */}
        <motion.button
          className="w-full mt-2 py-2 px-3 bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-sm text-[rgba(var(--mg-primary),0.9)] font-quantify tracking-wide flex items-center justify-center"
          whileHover={{ 
            backgroundColor: 'rgba(var(--mg-primary), 0.15)',
            borderColor: 'rgba(var(--mg-primary), 0.4)',
            boxShadow: '0 0 10px rgba(var(--mg-primary), 0.1)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          VIEW FULL CALENDAR
        </motion.button>
      </div>
    </MobiGlasPanel>
  );
};

export default UpcomingEventsPanel; 