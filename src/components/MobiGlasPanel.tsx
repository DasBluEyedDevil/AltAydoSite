import React, { ReactNode } from 'react';

interface MobiGlasPanelProps {
  children: ReactNode;
  className?: string;
}

const MobiGlasPanel: React.FC<MobiGlasPanelProps> = ({ children, className = '' }) => {
  return (
    <div className={`mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm ${className}`}>
      {children}
    </div>
  );
};

export default MobiGlasPanel; 