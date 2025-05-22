import React from 'react';
import { motion } from 'framer-motion';

interface CornerHighlightProps {
  isActive: boolean;
  isHovered?: boolean; // Optional: if direct hover state is needed instead of group-hover
}

const cornerVariants = {
  initial: { borderColor: 'rgba(var(--mg-primary),0)', boxShadow: '0 0 0px rgba(var(--mg-primary),0)' },
  active: { 
    borderColor: 'rgba(var(--mg-primary),0.7)', 
    boxShadow: '0 0 4px rgba(var(--mg-primary),0.4)' 
  },
};

const transition = { duration: 0.2 };

const CornerHighlight: React.FC<CornerHighlightProps> = ({ isActive }) => {
  return (
    <>
      {/* Top-left corner */}
      <motion.span
        className="absolute top-0 left-0 w-[5px] h-[5px] border-t border-l group-hover:border-[rgba(var(--mg-primary),0.7)] group-hover:shadow-[0_0_4px_rgba(var(--mg-primary),0.4)]"
        variants={cornerVariants}
        initial="initial"
        animate={isActive ? "active" : "initial"}
        transition={transition}
      />
      {/* Top-right corner */}
      <motion.span
        className="absolute top-0 right-0 w-[5px] h-[5px] border-t border-r group-hover:border-[rgba(var(--mg-primary),0.7)] group-hover:shadow-[0_0_4px_rgba(var(--mg-primary),0.4)]"
        variants={cornerVariants}
        initial="initial"
        animate={isActive ? "active" : "initial"}
        transition={transition}
      />
      {/* Bottom-left corner */}
      <motion.span
        className="absolute bottom-0 left-0 w-[5px] h-[5px] border-b border-l group-hover:border-[rgba(var(--mg-primary),0.7)] group-hover:shadow-[0_0_4px_rgba(var(--mg-primary),0.4)]"
        variants={cornerVariants}
        initial="initial"
        animate={isActive ? "active" : "initial"}
        transition={transition}
      />
      {/* Bottom-right corner */}
      <motion.span
        className="absolute bottom-0 right-0 w-[5px] h-[5px] border-b border-r group-hover:border-[rgba(var(--mg-primary),0.7)] group-hover:shadow-[0_0_4px_rgba(var(--mg-primary),0.4)]"
        variants={cornerVariants}
        initial="initial"
        animate={isActive ? "active" : "initial"}
        transition={transition}
      />
    </>
  );
};

export default CornerHighlight;
