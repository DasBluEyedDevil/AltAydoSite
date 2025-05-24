'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Types for the panel component
type CornerAccentPosition = 'tl' | 'tr' | 'bl' | 'br';

interface MobiGlasPanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  animationDelay?: number;
  className?: string;
  accentColor?: string;
  corners?: CornerAccentPosition[];
  rightContent?: ReactNode;
}

// Corner accent component
const CornerAccent = ({ position, color = 'primary' }: { position: CornerAccentPosition; color?: string }) => {
  const classes = {
    'tl': 'top-0 left-0 border-t border-l',
    'tr': 'top-0 right-0 border-t border-r',
    'bl': 'bottom-0 left-0 border-b border-l',
    'br': 'bottom-0 right-0 border-b border-r',
  };
  return (
    <div 
      className={`absolute w-5 h-5 ${classes[position]} border-[rgba(var(--mg-${color}),0.6)]`}
    ></div>
  );
};

/**
 * MobiGlasPanel - A reusable panel component styled with the MobiGlas aesthetic
 */
const MobiGlasPanel: React.FC<MobiGlasPanelProps> = ({ 
  title, 
  icon, 
  children, 
  animationDelay = 0, 
  className = '',
  accentColor = 'primary',
  corners = ['tl', 'tr', 'bl', 'br'],
  rightContent
}) => {
  // Animation variants for hover effect
  const hoverAnimation = {
    rest: { 
      boxShadow: '0 0 0 rgba(var(--mg-primary), 0)' 
    },
    hover: { 
      boxShadow: '0 0 15px rgba(var(--mg-primary), 0.1)' 
    }
  };
  
  // Content fade-in animation
  const contentAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        delay: 0.1
      }
    }
  };

  return (
    <motion.div
      className={`relative bg-[rgba(var(--mg-panel-dark),0.7)] backdrop-blur-md border border-[rgba(var(--mg-${accentColor}),0.3)] rounded-sm overflow-hidden h-full ${className}`}
      initial="rest"
      whileHover="hover"
      variants={hoverAnimation}
      transition={{ duration: 0.3 }}
    >
      {/* Corner accents */}
      {corners.includes('tl') && <CornerAccent position="tl" color={accentColor} />}
      {corners.includes('tr') && <CornerAccent position="tr" color={accentColor} />}
      {corners.includes('bl') && <CornerAccent position="bl" color={accentColor} />}
      {corners.includes('br') && <CornerAccent position="br" color={accentColor} />}
      
      {/* Top edge glow */}
      <div className={`absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[rgba(var(--mg-${accentColor}),0.5)] to-transparent`}></div>
      
      {/* Panel Header */}
      <div className="relative px-4 py-3 flex items-center justify-between border-b border-[rgba(var(--mg-primary),0.15)]">
        <div className="flex items-center">
          {icon && <div className="mr-2">{icon}</div>}
          <h3 className="mg-title text-sm sm:text-base font-quantify tracking-wider text-[rgba(var(--mg-${accentColor}),0.9)]">
            {title}
          </h3>
        </div>
        
        {/* Optional right content in header */}
        {rightContent && (
          <div className="flex items-center">
            {rightContent}
          </div>
        )}
      </div>
      
      {/* Panel Content */}
      <motion.div 
        className="p-4 relative"
        variants={contentAnimation}
        initial="hidden"
        animate="visible"
      >
        {/* Holographic grid background - subtle */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute inset-0 mg-panel-grid"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobiGlasPanel; 