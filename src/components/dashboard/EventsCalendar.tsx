'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useEvents } from '@/hooks/useEvents';
import { useUserTimezone } from '@/hooks/useUserTimezone';
import { EventData, EventType } from '@/lib/eventMapper';
import { getDateTimeInTimezone, getTimezoneAbbreviation } from '@/lib/timezone';

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
  
  // Get user's timezone preference first
  const { timezone: userTimezone, loading: timezoneLoading } = useUserTimezone();
  
  // Use the events hook for Discord integration (now timezone-aware)
  const { events: eventsData, loading, error, source, lastSync, refetch, refreshWithTimezone } = useEvents();
  
  // Debug logging
  console.log('EventsCalendar Debug:', {
    userTimezone,
    timezoneLoading,
    eventsCount: eventsData.length,
    sampleEventTime: eventsData.length > 0 ? eventsData[0].time : 'No events',
    source
  });

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

  // Auto-open event when eventId is provided via query param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('eventId');
    if (!eventIdParam || eventsData.length === 0) return;
    const targetId = Number(eventIdParam);
    const found = eventsData.find(e => e.id === targetId);
    if (found) {
      openEventDetails(found);
    }
  }, [eventsData]);

  // Get color for event type
  const getEventColor = (type: EventType) => {
    switch (type) {
      case EventType.General:
        return 'bg-blue-500';
      case EventType.AydoExpress:
        return 'bg-yellow-500';
      case EventType.EmpyrionIndustries:
        return 'bg-orange-500';
      case EventType.MidnightSecurity:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Generate calendar grid
  const renderCalendarDays = () => {
    let calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="h-10 border-t border-[rgba(var(--mg-primary),0.1)]"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = day === currentDay && viewMonth === currentMonth && viewYear === currentYear;
      
      calendarDays.push(
        <div 
          key={day}
          className={`h-24 md:h-28 border-t border-[rgba(var(--mg-primary),0.1)] p-1 ${
            isToday ? 'bg-[rgba(var(--mg-primary),0.1)]' : ''
          } relative`}
        >
          <div className={`text-xs ${isToday ? 'mg-title' : 'text-[rgba(var(--mg-text),0.7)]'}`}>
            {day}
          </div>
          
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[80%]">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded cursor-pointer ${getEventColor(event.type)} text-white truncate`}
                onClick={() => openEventDetails(event)}
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
    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="mg-title text-lg font-quantify">UPCOMING EVENTS</h2>
          
                      {/* Discord Integration Status */}
          <div className="flex items-center space-x-2">
            {loading || timezoneLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-[rgba(var(--mg-text),0.6)]">
                  {timezoneLoading ? 'Loading timezone...' : 'Syncing...'}
                </span>
              </div>
            ) : source === 'discord' ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-[rgba(var(--mg-text),0.6)]">Discord</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-[rgba(var(--mg-text),0.6)]">Local</span>
              </div>
            )}
            
            {/* Timezone indicator */}
            {!timezoneLoading && (
              <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[rgba(var(--mg-text),0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-[rgba(var(--mg-text),0.5)]">
                  {getTimezoneAbbreviation(userTimezone)}
                </span>
              </div>
            )}
            
            {/* Refresh Button */}
            <button 
              className="mg-btn-icon p-1 text-xs opacity-70 hover:opacity-100"
              onClick={() => {
                console.log('Manual refresh triggered, refreshing timezone and events');
                refreshWithTimezone();
              }}
              disabled={loading || timezoneLoading}
              title={`Refresh timezone and events (current timezone: ${getTimezoneAbbreviation(userTimezone)})`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              className="mg-btn-icon p-1" 
              onClick={goToPreviousMonth}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="mg-subtitle text-sm tracking-wider">
              {monthNames[viewMonth]} {viewYear}
            </span>
            
            <button 
              className="mg-btn-icon p-1" 
              onClick={goToNextMonth}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Calendar legend */}
      <div className="flex flex-wrap gap-4 mb-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
          <span className="text-xs text-[rgba(var(--mg-text),0.7)]">General Events</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
          <span className="text-xs text-[rgba(var(--mg-text),0.7)]">AydoExpress</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
          <span className="text-xs text-[rgba(var(--mg-text),0.7)]">Empyrion Industries</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
          <span className="text-xs text-[rgba(var(--mg-text),0.7)]">Midnight Security</span>
        </div>
      </div>
      
      {/* Calendar grid header */}
      <div className="grid grid-cols-7 bg-[rgba(var(--mg-panel-dark),0.6)]">
        {dayNames.map(day => (
          <div key={day} className="text-center py-1 text-xs mg-subtitle">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {renderCalendarDays()}
      </div>

      {/* Empty state when no events */}
      {!loading && !timezoneLoading && eventsData.length === 0 && (
        <div className="text-center py-8">
          <div className="mg-text opacity-60 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mg-subtitle text-sm">No events scheduled</p>
          <p className="text-xs text-[rgba(var(--mg-text),0.5)] mt-1">
            {error ? 'Discord integration not configured' : 'No upcoming events from Discord'}
          </p>
        </div>
      )}

      {/* Timezone change notice */}
      {!loading && !timezoneLoading && eventsData.length > 0 && (
        <div className="mt-2 text-center">
          <p className="text-xs text-[rgba(var(--mg-text),0.4)]">
            Times shown in {getTimezoneAbbreviation(userTimezone)} timezone. 
            Changed your timezone? Click refresh above.
          </p>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            className="w-full max-w-md mg-panel bg-[rgba(var(--mg-panel-dark),0.95)] p-4 rounded-sm m-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="mg-title text-lg font-quantify">{selectedEvent.title}</h3>
                <div className="flex items-center mt-1">
                  <div className={`w-3 h-3 rounded-sm mr-2 ${getEventColor(selectedEvent.type)}`}></div>
                  <p className="text-xs mg-subtitle">
                    {selectedEvent.type === EventType.General 
                      ? 'General Event' 
                      : selectedEvent.type === EventType.AydoExpress 
                        ? 'AydoExpress' 
                        : selectedEvent.type === EventType.EmpyrionIndustries
                          ? 'Empyrion Industries'
                          : 'Midnight Security'}
                  </p>
                </div>
              </div>
              <button 
                className="mg-btn-icon"
                onClick={closeEventDetails}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-primary),0.9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">
                  {getDateTimeInTimezone(selectedEvent.date, userTimezone)}
                </p>
              </div>
              
              <div className="pt-2 border-t border-[rgba(var(--mg-primary),0.1)]">
                <p className="text-sm text-[rgba(var(--mg-text),0.9)]">{selectedEvent.description}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                className="mg-btn mg-btn-primary text-xs py-1.5 px-3"
                onClick={closeEventDetails}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar; 