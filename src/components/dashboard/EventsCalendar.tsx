'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Enum for event types
enum EventType {
  General = 'general',
  AydoExpress = 'express',
  EmpyrionIndustries = 'empyrion'
}

// Interface for event data
interface EventData {
  id: number;
  title: string;
  date: Date;
  time: string;
  type: EventType;
  description: string;
}

// Sample event data
const eventsData: EventData[] = [
  {
    id: 1,
    title: 'Weekly Community Gathering',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2),
    time: '20:00 UTC',
    type: EventType.General,
    description: 'Our weekly community meetup for all members to socialize and plan activities.'
  },
  {
    id: 2,
    title: 'Cargo Run Training',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 4),
    time: '18:30 UTC',
    type: EventType.AydoExpress,
    description: 'Training session for new AydoExpress employees on cargo management and hauling operations.'
  },
  {
    id: 3,
    title: 'Mining Expedition',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5),
    time: '19:00 UTC',
    type: EventType.EmpyrionIndustries,
    description: 'Joint mining operation in the Aaron Halo asteroid belt. All mining vessels welcome.'
  },
  {
    id: 4,
    title: 'Fleet Week Preparation',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7),
    time: '21:00 UTC',
    type: EventType.General,
    description: 'Preparation meeting for the upcoming Fleet Week event. All departments should send representatives.'
  },
  {
    id: 5,
    title: 'Logistics Route Planning',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 9),
    time: '19:30 UTC',
    type: EventType.AydoExpress,
    description: 'Strategic meeting to plan new trade routes and optimize existing ones.'
  }
];

// Function to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Function to get day of week for first day of month
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Get current date
const currentDate = new Date();
const currentDay = currentDate.getDate();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

const EventsCalendar = () => {
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Month navigation
  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Get days for calendar display
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names for display
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter events for the current month view
  const monthEvents = eventsData.filter(event => {
    return event.date.getMonth() === viewMonth && event.date.getFullYear() === viewYear;
  });

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    return monthEvents.filter(event => event.date.getDate() === day);
  };

  // Open event details modal
  const openEventDetails = (event: EventData) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Close event details modal
  const closeEventDetails = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Get color for event type
  const getEventColorClass = (type: EventType) => {
    switch (type) {
      case EventType.General:
        return 'bg-[rgba(var(--mg-secondary),0.7)] hover:bg-[rgba(var(--mg-secondary),0.9)]'; // Blueish
      case EventType.AydoExpress:
        return 'bg-[rgba(var(--mg-warning),0.7)] hover:bg-[rgba(var(--mg-warning),0.9)]'; // Yellowish
      case EventType.EmpyrionIndustries:
        return 'bg-[rgba(var(--mg-danger),0.6)] hover:bg-[rgba(var(--mg-danger),0.8)]'; // Orangey/Reddish
      default:
        return 'bg-[rgba(var(--mg-text),0.3)] hover:bg-[rgba(var(--mg-text),0.5)]';
    }
  };

  // Generate calendar grid
  const renderCalendarDays = () => {
    let calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="h-12 md:h-16 border-t border-r border-[rgba(var(--mg-primary),0.05)]"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = day === currentDay && viewMonth === currentMonth && viewYear === currentYear;
      
      calendarDays.push(
        <div 
          key={day}
          className={`h-20 md:h-24 border-t border-r border-[rgba(var(--mg-primary),0.05)] p-1.5 transition-colors duration-150 hover:bg-[rgba(var(--mg-primary),0.03)] ${
            isToday ? 'bg-[rgba(var(--mg-primary),0.05)]' : ''
          } relative group`}
        >
          <div className={`text-xs text-right ${isToday ? 'mg-title text-[rgba(var(--mg-accent),0.9)]' : 'mg-text opacity-50 group-hover:opacity-80'}`}>
            {day}
          </div>
          
          <div className="mt-0.5 space-y-0.5 overflow-y-auto max-h-[70%] pr-1 custom-scrollbar-thin">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                className={`text-[10px] px-1 py-0.5 rounded-sm cursor-pointer ${getEventColorClass(event.type)} text-white truncate shadow-sm`}
                onClick={() => openEventDetails(event)}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return calendarDays;
  };

  return (
    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="mg-title text-base font-quantify uppercase">Events Calendar</h2> {/* Adjusted title */}
        
        <div className="flex items-center space-x-2">
            <button 
              className="mg-button p-1.5 w-7 h-7 flex items-center justify-center"  // Adjusted to mg-button
              onClick={goToPreviousMonth}
              aria-label="Previous Month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="mg-subtitle text-sm tracking-wider w-32 text-center"> {/* Added width for stability */}
              {monthNames[viewMonth]} {viewYear}
            </span>
            
            <button 
              className="mg-button p-1.5 w-7 h-7 flex items-center justify-center" // Adjusted to mg-button
              onClick={goToNextMonth}
              aria-label="Next Month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
        </div>
      </div>
      
      {/* Calendar legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
        <div className="flex items-center space-x-1.5">
          <div className={`w-2.5 h-2.5 rounded-sm ${getEventColorClass(EventType.General).split(' ')[0]}`}></div>
          <span className="mg-text text-[10px] opacity-70">General</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className={`w-2.5 h-2.5 rounded-sm ${getEventColorClass(EventType.AydoExpress).split(' ')[0]}`}></div>
          <span className="mg-text text-[10px] opacity-70">AydoExpress</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className={`w-2.5 h-2.5 rounded-sm ${getEventColorClass(EventType.EmpyrionIndustries).split(' ')[0]}`}></div>
          <span className="mg-text text-[10px] opacity-70">Empyrion</span>
        </div>
      </div>
      
      {/* Calendar grid header */}
      <div className="grid grid-cols-7 bg-[rgba(var(--mg-panel-dark),0.5)] border-t border-l border-[rgba(var(--mg-primary),0.05)]">
        {dayNames.map(day => (
          <div key={day} className="text-center py-1.5 text-[10px] mg-subtitle opacity-80 border-r border-[rgba(var(--mg-primary),0.05)]">
            {day.toUpperCase()}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-b border-[rgba(var(--mg-primary),0.05)] flex-grow">
        {renderCalendarDays()}
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-[rgba(var(--mg-dark),0.7)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="w-full max-w-md mg-panel bg-[rgba(var(--mg-panel-dark),0.9)] p-5 rounded-sm border border-[rgba(var(--mg-primary),0.2)] shadow-xl" // Enhanced modal panel
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "circOut" }}
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[rgba(var(--mg-primary),0.1)]">
              <div className="flex items-center">
                 <div className={`w-3 h-3 rounded-sm mr-2.5 ${getEventColorClass(selectedEvent.type).split(' ')[0]}`}></div>
                <h3 className="mg-title text-base font-quantify">{selectedEvent.title}</h3>
              </div>
              <button 
                className="mg-button p-1 w-7 h-7 flex items-center justify-center" // Styled close button
                onClick={closeEventDetails}
                aria-label="Close event details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mg-text opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mg-text opacity-90">
                  {selectedEvent.date.toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mg-text opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mg-text opacity-90">{selectedEvent.time}</p>
              </div>
              
              <div className="pt-2 border-t border-[rgba(var(--mg-primary),0.1)]">
                <p className="mg-text opacity-90 leading-relaxed">{selectedEvent.description}</p>
              </div>
            </div>
            
            <div className="mt-5 flex justify-end">
              <button 
                className="mg-button text-xs py-1.5 px-4" // Standard mg-button
                onClick={closeEventDetails}
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar; 