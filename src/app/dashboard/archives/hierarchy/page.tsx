'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PersonCardProps {
  title: string;
  loreName: string;
  handle: string;
  isFlippable?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({ title, loreName, handle, isFlippable = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (isFlippable) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div className="relative w-full h-36 cursor-pointer" style={{ perspective: '1000px' }}>
      <div
        className="absolute w-full h-full"
        onClick={handleClick}
        style={{ 
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : '',
          position: 'relative',
          zIndex: isFlipped ? 100 : 1
        }}
      >
        {/* Front of card */}
        <div 
          className={`absolute w-full h-full flex flex-col justify-center items-center p-3 mg-panel bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.4)] rounded-sm ${isFlippable ? 'hover:bg-[rgba(var(--mg-panel-dark),0.8)]' : ''}`}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            position: 'absolute',
            transform: 'translateZ(0)'
          }}
        >
          <div className="text-lg font-quantify tracking-wider text-center text-[rgba(var(--mg-primary),0.9)]">
            {title}
          </div>
          {isFlippable && (
            <div className="text-[10px] text-[rgba(var(--mg-text),0.6)] mt-2">
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
            transform: 'rotateY(180deg) translateZ(0)',
            position: 'absolute'
          }}
        >
          <div className="text-xs text-[rgba(var(--mg-text),0.6)]">
            {title}
          </div>
          <div className="text-lg font-quantify tracking-wider text-center text-[rgba(var(--mg-primary),0.9)] my-2">
            {loreName}
          </div>
          <div className="text-sm text-[rgba(var(--mg-accent),0.8)]">
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
      <div className="hexagon-bg absolute inset-0 opacity-5 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="mg-title text-2xl sm:text-3xl lg:text-4xl mb-4">Hierarchy Chart</h1>
          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.7)] to-transparent"></div>
        </motion.div>

        {/* Personnel Hierarchy Tree */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative mb-8"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-xl mb-6">Personnel Chart</h2>
          
          <div className="relative">
            {/* CEO Level */}
            <div className="flex justify-center mb-8">
              <div className="w-64">
                <PersonCard 
                  title="CEO"
                  loreName="Christoff Revan" 
                  handle="Udon"
                />
              </div>
            </div>
            
            {/* Vertical line from CEO to COO */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-36 h-8 w-px bg-[rgba(var(--mg-primary),0.6)]"></div>
            
            {/* CMO, COO, CSO Level */}
            <div className="flex justify-center space-x-4 sm:space-x-10 mb-8">
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="CMO"
                  loreName="Zane Makay" 
                  handle="Noodles"
                />
              </div>
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="COO"
                  loreName="Kaibo Zaber" 
                  handle="Kaibo_Z"
                />
              </div>
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="CSO"
                  loreName="Christus Sanctus" 
                  handle="Devil"
                />
              </div>
            </div>
            
            {/* Connecting lines */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-[11rem] h-8 w-px bg-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute left-1/2 transform -translate-x-1/2 top-[11rem] w-[30rem] h-px bg-[rgba(var(--mg-primary),0.6)]"></div>
            
            {/* Director Level */}
            <div className="flex justify-center space-x-4 sm:space-x-10 mb-8">
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="Director of AydoExpress"
                  loreName="Darren Express" 
                  handle="Delta_Dart_42"
                />
              </div>
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="Director of Empyrion Industries"
                  loreName="Stephanie Carder" 
                  handle="RamboSteph"
                />
              </div>
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="Director of Midnight Security"
                  loreName="Marcus Green" 
                  handle="MR-GR33N"
                />
              </div>
            </div>
            
            {/* Connecting lines */}
            <div className="absolute left-1/4 transform -translate-x-1/2 top-[19rem] h-8 w-px bg-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute left-1/2 transform -translate-x-1/2 top-[19rem] h-8 w-px bg-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute left-3/4 transform -translate-x-1/2 top-[19rem] h-8 w-px bg-[rgba(var(--mg-primary),0.6)]"></div>
            
            {/* Manager Level */}
            <div className="flex justify-center space-x-4 sm:space-x-10">
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="AydoExpress Manager"
                  loreName="Alex Delivery" 
                  handle="Alex_D"
                />
              </div>
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="Empyrion Industries Manager"
                  loreName="Archie Zero" 
                  handle="ArcZeroNine"
                />
              </div>
              <div className="w-48 sm:w-56">
                <PersonCard 
                  title="Midnight Security Manager"
                  loreName="Devon Shield" 
                  handle="Shield_GS"
                />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Generic Rank Tree */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative mb-8"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-xl mb-6">General Rank Structure</h2>
          
          <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
            {["Board Member", "Director", "Manager", "Supervisor", "Senior Employee", "Employee", "Intern/Freelancer"].map((rank, i) => (
              <motion.div
                key={rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className={`flex items-center p-3 mg-panel bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.4)] rounded-sm`}
              >
                <div className="h-2 w-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-3"></div>
                <span className="mg-text">{rank}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Subsidiary Rank Charts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-xl mb-6">Subsidiary Rank Charts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AydoExpress Ranks */}
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 relative mr-2 rounded-sm overflow-hidden">
                  <Image 
                    src="/images/Aydo_Express.png" 
                    alt="AydoExpress Logo" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <h3 className="mg-subtitle">AydoExpress</h3>
              </div>
              
              <div className="space-y-2">
                {[
                  "Director",
                  "Subdirector",
                  "Manager",
                  "Supervisor",
                  "Loadmaster",
                  "Senior Service Agent",
                  "Service Agent",
                  "Associate",
                  "Trainee"
                ].map((rank, i) => (
                  <motion.div
                    key={rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className="flex items-center p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(0,210,255,0.6)] rounded-sm"
                  >
                    <span className="mg-text text-sm">{rank}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Empyrion Industries Ranks */}
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 relative mr-2 rounded-sm overflow-hidden">
                  <Image 
                    src="/images/Empyrion_Industries.png" 
                    alt="Empyrion Industries Logo" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <h3 className="mg-subtitle">Empyrion Industries</h3>
              </div>
              
              <div className="space-y-2">
                {[
                  "Director",
                  "Subdirector",
                  "Manager",
                  "Supervisor",
                  "Journeyman",
                  "Senior Specialist",
                  "Specialist",
                  "Technician",
                  "Initiate"
                ].map((rank, i) => (
                  <motion.div
                    key={rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className="flex items-center p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(200,220,255,0.6)] rounded-sm"
                  >
                    <span className="mg-text text-sm">{rank}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Midnight Security Ranks */}
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 relative mr-2 rounded-sm overflow-hidden bg-[rgba(var(--mg-panel-dark),0.7)] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.141 13.669 2.931 18.16 5.25 21.15c1.094 1.39 2.362 2.393 3.75 2.85M15.75 21.15c1.094-1.39 2.163-2.927 2.81-4.666" />
                  </svg>
                </div>
                <h3 className="mg-subtitle">Midnight Security</h3>
              </div>
              
              <div className="space-y-2">
                {[
                  "Director",
                  "Vice Director",
                  "Risk Manager",
                  "Security Supervisor",
                  "Compliance Officer",
                  "Compliance Agent",
                  "Security Specialist",
                  "Security Associate",
                  "Observer"
                ].map((rank, i) => (
                  <motion.div
                    key={rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className="flex items-center p-2 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(120,140,180,0.6)] rounded-sm"
                  >
                    <span className="mg-text text-sm">{rank}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-6 text-center text-xs text-[rgba(var(--mg-text),0.6)]">
          AYDO INTERGALACTIC CORPORATION - INTERNAL ARCHIVES
        </div>
      </div>
    </div>
  );
} 