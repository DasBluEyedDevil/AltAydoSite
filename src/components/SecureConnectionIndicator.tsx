'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function SecureConnectionIndicator() {
  const { status } = useSession();
  
  // Only show when authenticated
  if (status !== 'authenticated') {
    return null;
  }
  
  return (
    <div
      className="fixed top-20 right-4 z-50 bg-[rgba(0,20,40,0.8)] px-3 py-1.5 rounded-sm border border-[rgba(var(--mg-primary),0.2)] shadow-lg"
    >
      <div className="text-xs text-gray-400 flex items-center">
        <div className="h-1.5 w-1.5 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2 animate-pulse"></div>
        SECURE CONNECTION
      </div>
    </div>
  );
} 