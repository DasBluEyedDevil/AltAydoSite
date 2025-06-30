'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PersonCardProps {
  title: string;
  loreName: string;
  handle: string;
  isFlippable?: boolean;
  className?: string;
}

const PersonCard: React.FC<PersonCardProps> = ({ title, loreName, handle, isFlippable = true, className = "" }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (isFlippable) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className={`relative w-full h-32 cursor-pointer ${className}`} style={{ perspective: '1000px' }}>
      <div
        className="absolute w-full h-full"
        onClick={handleClick}
        style={{ 
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : '',
        }}
      >
        {/* Front of card */}
        <div 
          className="absolute w-full h-full flex flex-col justify-center items-center p-3 mg-panel bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.4)] rounded-sm hover:bg-[rgba(var(--mg-panel-dark),0.8)] transition-colors"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="text-sm font-quantify tracking-wider text-center text-[rgba(var(--mg-primary),0.9)] leading-tight">
            {title}
          </div>
          {isFlippable && (
            <div className="text-[10px] text-[rgba(var(--mg-text),0.6)] mt-1">
              (Click for details)
            </div>
          )}
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full p-3 mg-panel bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.4)] rounded-sm flex flex-col justify-center items-center"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-xs text-[rgba(var(--mg-text),0.6)]">
            {title}
          </div>
          <div className="text-sm font-quantify tracking-wider text-center text-[rgba(var(--mg-primary),0.9)] my-1">
            {loreName}
          </div>
          <div className="text-xs text-[rgba(var(--mg-accent),0.8)]">
            {handle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HierarchyChartPage() {
  return (
    <div className="min-h-screen bg-black bg-opacity-95 p-6 relative">
      {/* Holographic background effects */}
      <div className="absolute inset-0 bg-holo-grid bg-[length:50px_50px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="mg-title text-2xl sm:text-3xl lg:text-4xl mb-4">AydoCorp Hierarchy Chart</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.7)] to-transparent"></div>
        </motion.div>

        {/* Personnel Hierarchy Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-8 rounded-sm relative mb-8"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-xl mb-8 text-center">Organizational Structure</h2>
          
          {/* Hierarchy Tree */}
          <div className="space-y-8">
            
            {/* CEO Level */}
            <div className="flex justify-center">
              <div className="w-64">
                <PersonCard 
                  title="Chief Executive Officer"
                  loreName="Christoff Revan" 
                  handle="Udon"
                />
              </div>
            </div>
            
            {/* Connection line to board */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-[rgba(var(--mg-primary),0.6)]"></div>
            </div>
            
            {/* Board Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="space-y-4">
                <PersonCard 
                  title="Chief Marketing Officer"
                  loreName="Zane Makay" 
                  handle="Noodles"
                />
                <div className="text-center text-xs text-[rgba(var(--mg-text),0.5)]">
                  Marketing & Communications
                </div>
              </div>
              
              <div className="space-y-4">
                <PersonCard 
                  title="Chief Operations Officer"
                  loreName="Kaibo Zaber" 
                  handle="Kaibo_Z"
                />
                <div className="text-center text-xs text-[rgba(var(--mg-text),0.5)]">
                  Subsidiary Operations
                </div>
                
                {/* Connection line to subsidiaries */}
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-[rgba(var(--mg-primary),0.6)]"></div>
                </div>
                
                {/* Subsidiary Directors under COO */}
                <div className="space-y-4 pt-4">
                  <div className="grid gap-4">
                    <PersonCard 
                      title="Director - AydoExpress"
                      loreName="Darren Express" 
                      handle="Delta_Dart_42"
                      className="text-xs"
                    />
                    <PersonCard 
                      title="Director - Empyrion Industries"
                      loreName="Stephanie Carder" 
                      handle="RamboSteph"
                      className="text-xs"
                    />
                    <PersonCard 
                      title="Director - Midnight Security"
                      loreName="Marcus Green" 
                      handle="MR-GR33N"
                      className="text-xs"
                    />
                  </div>
                  
                  {/* Connection to managers */}
                  <div className="flex justify-center">
                    <div className="w-px h-6 bg-[rgba(var(--mg-primary),0.4)]"></div>
                  </div>
                  
                  {/* Subsidiary Managers */}
                  <div className="grid gap-3">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm">
                        <div className="text-[rgba(var(--mg-text),0.8)]">AydoExpress Manager</div>
                        <div className="text-[rgba(var(--mg-accent),0.6)]">Alex Delivery (Alex_D)</div>
                      </div>
                      <div className="p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm">
                        <div className="text-[rgba(var(--mg-text),0.8)]">Empyrion Manager</div>
                        <div className="text-[rgba(var(--mg-accent),0.6)]">Archie Zero (ArcZeroNine)</div>
                      </div>
                      <div className="p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm">
                        <div className="text-[rgba(var(--mg-text),0.8)]">Security Manager</div>
                        <div className="text-[rgba(var(--mg-accent),0.6)]">Devon Shield (Shield_GS)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <PersonCard 
                  title="Chief Security Officer"
                  loreName="Christus Sanctus" 
                  handle="Devil"
                />
                <div className="text-center text-xs text-[rgba(var(--mg-text),0.5)]">
                  Corporate Security & Compliance
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* General Rank Structure */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Corporate Ranks */}
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
            
            <h2 className="mg-subtitle text-lg mb-6">Corporate Rank Structure</h2>
            
            <div className="space-y-3">
              {[
                { rank: "Board Member", level: "Executive" },
                { rank: "Director", level: "Senior Leadership" },
                { rank: "Manager", level: "Management" },
                { rank: "Supervisor", level: "Team Lead" },
                { rank: "Senior Employee", level: "Experienced" },
                { rank: "Employee", level: "Standard" },
                { rank: "Intern/Freelancer", level: "Entry Level" }
              ].map((item, i) => (
                <motion.div
                  key={item.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="flex items-center justify-between p-3 bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm"
                >
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-3"></div>
                    <span className="mg-text font-semibold">{item.rank}</span>
                  </div>
                  <span className="text-xs text-[rgba(var(--mg-text),0.6)]">{item.level}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Reference */}
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
            
            <h2 className="mg-subtitle text-lg mb-6">Reporting Structure</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-4 border-[rgba(var(--mg-primary),0.6)] rounded-sm">
                <h3 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-2">Board Members</h3>
                <p className="text-xs text-[rgba(var(--mg-text),0.7)]">Report directly to CEO. Responsible for strategic oversight of their respective divisions.</p>
              </div>
              
              <div className="p-4 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-4 border-[rgba(var(--mg-accent),0.6)] rounded-sm">
                <h3 className="text-sm font-semibold text-[rgba(var(--mg-accent),0.9)] mb-2">Subsidiary Directors</h3>
                <p className="text-xs text-[rgba(var(--mg-text),0.7)]">Report to COO. Manage day-to-day operations of AydoExpress, Empyrion Industries, and Midnight Security.</p>
              </div>
              
              <div className="p-4 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-4 border-[rgba(var(--mg-secondary),0.6)] rounded-sm">
                <h3 className="text-sm font-semibold text-[rgba(var(--mg-secondary),0.9)] mb-2">Managers & Staff</h3>
                <p className="text-xs text-[rgba(var(--mg-text),0.7)]">Report through subsidiary chain of command. Handle operational tasks and team management.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subsidiary Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-xl mb-6">Subsidiary Organizations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AydoExpress */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 relative mr-3 rounded-sm overflow-hidden">
                  <Image 
                    src="/images/Aydo_Express.png" 
                    alt="AydoExpress Logo" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="mg-subtitle text-lg">AydoExpress</h3>
                  <p className="text-xs text-[rgba(var(--mg-text),0.6)]">Transportation & Logistics</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {[
                  "Director", "Subdirector", "Manager", "Supervisor", 
                  "Loadmaster", "Senior Service Agent", "Service Agent", "Associate", "Trainee"
                ].map((rank, i) => (
                  <div key={rank} className="flex items-center p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(0,210,255,0.6)] rounded-sm">
                    <span className="mg-text text-sm">{rank}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Empyrion Industries */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 relative mr-3 rounded-sm overflow-hidden">
                  <Image 
                    src="/images/Empyrion_Industries.png" 
                    alt="Empyrion Industries Logo" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="mg-subtitle text-lg">Empyrion Industries</h3>
                  <p className="text-xs text-[rgba(var(--mg-text),0.6)]">Manufacturing & Engineering</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {[
                  "Director", "Subdirector", "Manager", "Supervisor",
                  "Journeyman", "Senior Specialist", "Specialist", "Technician", "Initiate"
                ].map((rank, i) => (
                  <div key={rank} className="flex items-center p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(200,220,255,0.6)] rounded-sm">
                    <span className="mg-text text-sm">{rank}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Midnight Security */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 relative mr-3 rounded-sm overflow-hidden bg-[rgba(var(--mg-panel-dark),0.7)] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.141 13.669 2.931 18.16 5.25 21.15c1.094 1.39 2.362 2.393 3.75 2.85" />
                  </svg>
                </div>
                <div>
                  <h3 className="mg-subtitle text-lg">Midnight Security</h3>
                  <p className="text-xs text-[rgba(var(--mg-text),0.6)]">Security & Risk Management</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {[
                  "Director", "Vice Director", "Risk Manager", "Security Supervisor",
                  "Compliance Officer", "Compliance Agent", "Security Specialist", "Security Associate", "Observer"
                ].map((rank, i) => (
                  <div key={rank} className="flex items-center p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(120,140,180,0.6)] rounded-sm">
                    <span className="mg-text text-sm">{rank}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center text-xs text-[rgba(var(--mg-text),0.6)]">
          AYDO INTERGALACTIC CORPORATION - CORPORATE ARCHIVES SYSTEM
        </div>
      </div>
    </div>
  );
} 