'use client';

import React from 'react';
import { motion } from 'framer-motion';
import EventsCalendar from '@/components/dashboard/EventsCalendar';
import MobiGlasPanel from '@/components/dashboard/MobiGlasPanel';

export default function EventsCalendarPage() {
  return (
    <div className="min-h-screen bg-black bg-opacity-95 p-6 relative">
      {/* Holographic background effects */}
      <div className="absolute inset-0 bg-holo-grid bg-[length:50px_50px] opacity-5 pointer-events-none"></div>
      <div className="hexagon-bg absolute inset-0 opacity-5 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="mg-title text-2xl sm:text-3xl lg:text-4xl mb-4">Events Calendar</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.7)] to-transparent"></div>
        </motion.div>

        {/* Events Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <EventsCalendar />
        </motion.div>

        {/* Upcoming Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MobiGlasPanel
              title="CORPORATE EVENTS"
              animationDelay={0.2}
              accentColor="primary"
              corners={['tl', 'br']}
            >
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="mg-subtitle text-lg">Weekly Events</h3>
                  <ul className="list-disc pl-6 space-y-2 mg-text">
                    <li>Community Gathering - Every Saturday at 20:00 UTC</li>
                    <li>Management Meeting - Every Monday at 18:00 UTC</li>
                    <li>Training Sessions - Every Wednesday at 19:00 UTC</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="mg-subtitle text-lg">Monthly Events</h3>
                  <ul className="list-disc pl-6 space-y-2 mg-text">
                    <li>Fleet Review - First Sunday of each month</li>
                    <li>Resource Planning - Last Friday of each month</li>
                  </ul>
                </div>
              </div>
            </MobiGlasPanel>

            <MobiGlasPanel
              title="UPCOMING SPECIAL EVENTS"
              animationDelay={0.3}
              accentColor="warning"
              corners={['tr', 'bl']}
            >
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="mg-subtitle text-lg">Quarterly Corporate Events</h3>
                  <ul className="list-disc pl-6 space-y-2 mg-text">
                    <li>Q3 Financial Review - September 15, 2953</li>
                    <li>Annual Corporate Celebration - December 20, 2953</li>
                    <li>New Year Fleet Showcase - January 5, 2954</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="mg-subtitle text-lg">Special Operations</h3>
                  <ul className="list-disc pl-6 space-y-2 mg-text">
                    <li>Joint Mining Expedition - Yela Asteroid Belt - Aug 25, 2953</li>
                    <li>Cross-System Cargo Haul - Stanton to Pyro - Sept 10, 2953</li>
                  </ul>
                </div>
              </div>
            </MobiGlasPanel>
          </div>
        </motion.div>

        {/* Event Submission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <MobiGlasPanel
            title="SUBMIT EVENT PROPOSAL"
            animationDelay={0.4}
            accentColor="accent"
            corners={['tl', 'tr', 'bl', 'br']}
          >
            <div className="p-4">
              <p className="mg-text mb-4">
                Have an idea for a corporate event? Submit your proposal for review by management.
              </p>
              <div className="flex items-center justify-center">
                <motion.button
                  className="mg-btn bg-[rgba(var(--mg-accent),0.2)] border border-[rgba(var(--mg-accent),0.4)] text-[rgba(var(--mg-accent),0.9)] hover:bg-[rgba(var(--mg-accent),0.3)] px-6 py-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-quantify tracking-wider">SUBMIT PROPOSAL</span>
                </motion.button>
              </div>
            </div>
          </MobiGlasPanel>
        </motion.div>
        
        <div className="mt-6 text-center text-xs text-[rgba(var(--mg-text),0.6)]">
          AYDO INTERGALACTIC CORPORATION - EVENTS MANAGEMENT SYSTEM
        </div>
      </div>
    </div>
  );
} 