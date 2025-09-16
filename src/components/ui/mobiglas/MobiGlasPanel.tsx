'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface MobiGlasPanelProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  variant?: 'default' | 'dark' | 'darker' | 'transparent';
  withScanline?: boolean;
  withHologram?: boolean;
  withCircuitBg?: boolean;
  withGridBg?: boolean;
  cornerAccents?: boolean;
  cornerSize?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function MobiGlasPanel({
  children,
  className = '',
  title,
  titleClassName = '',
  variant = 'default',
  withScanline = false,
  withHologram = false,
  withCircuitBg = false,
  withGridBg = false,
  cornerAccents = true,
  cornerSize = 'md',
  padding = 'md',
  ...motionProps
}: MobiGlasPanelProps) {
  const variantStyles = {
    default: 'bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)]',
    dark: 'bg-[rgba(var(--mg-dark),0.4)] border border-[rgba(var(--mg-primary),0.3)]',
    darker: 'bg-[rgba(var(--mg-panel-dark),0.8)] border border-[rgba(var(--mg-primary),0.4)]',
    transparent: 'bg-transparent border border-[rgba(var(--mg-primary),0.2)]'
  };

  const paddingMap = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const cornerSizeMap = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden backdrop-blur-sm
        ${variantStyles[variant]}
        ${paddingMap[padding]}
        ${className}
      `.trim()}
      {...motionProps}
    >
      {/* Background effects */}
      {withHologram && (
        <div className="absolute inset-0 holo-noise opacity-20 pointer-events-none"></div>
      )}

      {withCircuitBg && (
        <div className="absolute inset-0 circuit-bg opacity-5 pointer-events-none"></div>
      )}

      {withGridBg && (
        <div className="absolute inset-0 mg-grid-bg opacity-10 pointer-events-none"></div>
      )}

      {/* Scanline effect */}
      {withScanline && (
        <motion.div
          className="absolute top-0 w-full h-1 opacity-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(var(--mg-primary), 1), transparent)'
          }}
          animate={{
            top: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* Corner accents */}
      {cornerAccents && (
        <>
          <div className={`absolute top-0 left-0 ${cornerSizeMap[cornerSize]} border-t border-l border-[rgba(var(--mg-primary),0.6)]`}></div>
          <div className={`absolute top-0 right-0 ${cornerSizeMap[cornerSize]} border-t border-r border-[rgba(var(--mg-primary),0.6)]`}></div>
          <div className={`absolute bottom-0 left-0 ${cornerSizeMap[cornerSize]} border-b border-l border-[rgba(var(--mg-primary),0.6)]`}></div>
          <div className={`absolute bottom-0 right-0 ${cornerSizeMap[cornerSize]} border-b border-r border-[rgba(var(--mg-primary),0.6)]`}></div>
        </>
      )}

      {/* Title */}
      {title && (
        <div className="relative z-10 mb-6">
          <h2 className={`mg-title text-2xl font-bold ${titleClassName}`}>
            {title}
          </h2>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}