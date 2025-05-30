import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionResponse } from '@/types/Mission';
import MissionCard from './MissionCard';

interface MissionListProps {
  missions: MissionResponse[];
  onMissionClick: (mission: MissionResponse) => void;
  loading?: boolean;
  error?: string | null;
}

const MissionList: React.FC<MissionListProps> = ({ 
  missions, 
  onMissionClick, 
  loading = false, 
  error = null 
}) => {
  // State for floating data points
  const [floatingPoints, setFloatingPoints] = useState<Array<{x: number, y: number, size: number, duration: number}>>([]);
  
  // Generate random floating data points
  useEffect(() => {
    if (!loading && missions.length > 0) {
      const points = Array.from({ length: 15 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 10
      }));
      setFloatingPoints(points);
    }
  }, [loading, missions.length]);
  
  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  // Empty state
  if (missions.length === 0 && !loading && !error) {
    return null; // Return null as the empty state is handled by MissionDashboard
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 relative">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Data transmission visualization */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Random data streams */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.6)] to-transparent"
              style={{ 
                top: `${Math.random() * 100}%`,
                left: 0,
                width: `${Math.random() * 50 + 50}%`,
                opacity: Math.random() * 0.5 + 0.3
              }}
              animate={{ x: ["0%", "100%"] }}
              transition={{ 
                duration: Math.random() * 4 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            />
          ))}
          
          {/* Binary data visualization */}
          <div className="absolute inset-0 flex flex-wrap content-start opacity-10 overflow-hidden">
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                className="text-xs font-mono text-[rgba(var(--mg-primary),0.7)]"
                style={{ margin: '0 3px' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              >
                {Math.random() > 0.5 ? '1' : '0'}
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="relative w-24 h-24 mb-6">
            {/* Central spinning element */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[rgba(var(--mg-primary),0.4)] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Outer spinning ring */}
            <motion.div
              className="absolute inset-2 rounded-full border border-[rgba(var(--mg-primary),0.2)] border-b-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner spinning ring */}
            <motion.div
              className="absolute inset-4 rounded-full border border-[rgba(var(--mg-primary),0.3)] border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Pulsing core */}
            <motion.div
              className="absolute inset-7 rounded-full bg-[rgba(var(--mg-primary),0.1)]"
              animate={{ 
                boxShadow: [
                  "0 0 10px 0 rgba(var(--mg-primary), 0.3)",
                  "0 0 20px 5px rgba(var(--mg-primary), 0.6)",
                  "0 0 10px 0 rgba(var(--mg-primary), 0.3)"
                ],
                backgroundColor: [
                  "rgba(var(--mg-primary), 0.1)",
                  "rgba(var(--mg-primary), 0.3)",
                  "rgba(var(--mg-primary), 0.1)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Orbiting element */}
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-[rgba(var(--mg-primary),0.5)]"
              style={{ top: '10%', left: '50%', x: '-50%', y: '-50%' }}
              animate={{
                rotate: [0, 360]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute"
                style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                animate={{
                  x: [0, 40, 0, -40, 0],
                  y: [0, 40, 0, -40, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)]" />
              </motion.div>
            </motion.div>
          </div>
          
          <motion.p 
            className="mg-text-secondary text-lg mb-4 font-quantify tracking-widest"
            animate={{ 
              textShadow: [
                "0 0 5px rgba(var(--mg-primary), 0.3)",
                "0 0 15px rgba(var(--mg-primary), 0.5)",
                "0 0 5px rgba(var(--mg-primary), 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            RETRIEVING DATA
          </motion.p>
          
          <p className="mg-text-secondary text-sm mb-5 opacity-70">
            Accessing mission database...
          </p>
          
          {/* Loading progress bar */}
          <div className="w-64 h-1 relative bg-[rgba(var(--mg-panel-dark),0.5)] overflow-hidden rounded-sm">
            <motion.div 
              className="absolute h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.5)] to-[rgba(var(--mg-primary),0.8)]"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "50%", "75%", "90%", "95%"] }}
              transition={{ 
                duration: 3, 
                times: [0, 0.3, 0.5, 0.8, 1],
                repeat: Infinity 
              }}
            />
            
            {/* Scanning effect */}
            <motion.div
              className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          {/* Status text */}
          <div className="mt-5 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {["Connecting to database...", "Authorizing access...", "Downloading mission data..."].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-xs text-[rgba(var(--mg-primary),0.7)]"
                >
                  {text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center relative">
        {/* Error effect background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-[rgba(var(--mg-danger),0.03)]"
            animate={{ opacity: [0.03, 0.08, 0.03] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Error glitch effect lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px w-full bg-[rgba(var(--mg-danger),0.2)]"
              style={{ top: `${Math.random() * 100}%` }}
              animate={{ 
                scaleX: [1, 0.9, 1.1, 1],
                x: [0, 10, -10, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
          ))}
          
          {/* Warning triangles */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-10"
              style={{ 
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              <svg className="w-20 h-20 text-[rgba(var(--mg-danger),1)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L1 21h22L12 2zm0 3.99L20.53 19H3.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z" />
              </svg>
            </motion.div>
          ))}
        </div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 mb-4 relative">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[rgba(var(--mg-danger),0.3)]"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(var(--mg-danger), 0)",
                  "0 0 0 10px rgba(var(--mg-danger), 0.1)",
                  "0 0 0 20px rgba(var(--mg-danger), 0)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            
            {/* Glitching warning icon */}
            <motion.div
              animate={{ 
                x: [0, -2, 3, -3, 0],
                opacity: [1, 0.8, 1]
              }}
              transition={{ 
                duration: 0.5, 
                repeat: Infinity, 
                repeatType: "mirror",
                repeatDelay: 3
              }}
            >
              <svg
                className="w-full h-full text-[rgba(var(--mg-danger),0.7)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </motion.div>
          </div>
          
          <motion.p 
            className="mg-text text-2xl mb-2 font-quantify tracking-wider text-[rgba(var(--mg-danger),0.9)]"
            animate={{ 
              textShadow: [
                "0 0 5px #aa3f3f4d", 
                "0 0 15px #aa3f3f80", 
                "0 0 5px #aa3f3f4d"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SYSTEM ERROR
          </motion.p>
          
          <div className="relative mb-5">
            <p className="mg-text-secondary text-sm opacity-70 max-w-md">{error}</p>
            
            {/* Glitch effect */}
            <AnimatePresence>
              <motion.div
                className="absolute inset-0 overflow-hidden opacity-0"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ 
                  duration: 0.2, 
                  repeat: Infinity, 
                  repeatDelay: 5
                }}
              >
                <p className="mg-text-secondary text-sm opacity-70 max-w-md text-[rgba(var(--mg-danger),1)]">
                  CRITICAL FAILURE: SYSTEM MALFUNCTION
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Diagnostics terminal */}
          <motion.div
            className="w-64 mx-auto mt-4 p-3 bg-[rgba(0,0,0,0.3)] border border-[rgba(var(--mg-danger),0.3)] font-mono text-xs text-[rgba(var(--mg-danger),0.7)] text-left"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>{'>'} DIAGNOSTIC REPORT</p>
            <p>{'>'} ERROR CODE: 0x8734F</p>
            <p>{'>'} ATTEMPTING RECONNECT...</p>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-[rgba(var(--mg-danger),0.7)] ml-1"
            />
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating data points */}
        {floatingPoints.map((point, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-[rgba(var(--mg-primary),0.4)]"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: `${point.size}px`,
              height: `${point.size}px`,
            }}
            animate={{
              y: ['-20px', '20px'],
              opacity: [0.4, 0.7, 0.4],
              boxShadow: [
                '0 0 0 0 rgba(var(--mg-primary), 0)',
                '0 0 3px 1px rgba(var(--mg-primary), 0.3)',
                '0 0 0 0 rgba(var(--mg-primary), 0)'
              ]
            }}
            transition={{
              y: { duration: point.duration, repeat: Infinity, repeatType: 'reverse' },
              opacity: { duration: point.duration / 2, repeat: Infinity, repeatType: 'reverse' },
              boxShadow: { duration: point.duration / 3, repeat: Infinity }
            }}
          />
        ))}
        
        {/* Scan lines */}
        <motion.div
          className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"
          initial={{ top: '-100%' }}
          animate={{ top: '200%' }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"
          initial={{ left: '-100%' }}
          animate={{ left: '200%' }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10"
      >
        {missions.map(mission => (
          <MissionCard 
            key={mission.id} 
            mission={mission} 
            onClick={() => onMissionClick(mission)} 
          />
        ))}
      </motion.div>
      
      {/* Data analysis visualization */}
      <div className="absolute bottom-4 right-4 w-32 h-32 pointer-events-none opacity-60 z-0">
        <motion.div
          className="absolute inset-0 rounded-full border border-[rgba(var(--mg-primary),0.3)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {/* Orbiting elements */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[rgba(var(--mg-primary),0.6)]"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translate(40px) rotate(-${angle}deg)`,
                transformOrigin: 'center center'
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25
              }}
            />
          ))}
        </motion.div>
        
        <motion.div
          className="absolute inset-4 rounded-full border border-dashed border-[rgba(var(--mg-primary),0.2)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          className="absolute inset-8 rounded-full border border-dotted border-[rgba(var(--mg-primary),0.1)]"
          animate={{ rotate: 180 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          className="absolute inset-[14px] rounded-full bg-[rgba(var(--mg-primary),0.05)]"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(var(--mg-primary), 0)',
              '0 0 5px 2px rgba(var(--mg-primary), 0.2)',
              '0 0 0 0 rgba(var(--mg-primary), 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
};

export default MissionList; 