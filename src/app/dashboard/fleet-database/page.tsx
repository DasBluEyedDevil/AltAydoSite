'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import MobiGlasPanel from '@/components/ui/mobiglas/MobiGlasPanel';

export default function FleetDatabasePage() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mg-text text-center">
          <div className="mg-loader"></div>
          <p className="mt-4">Loading Fleet Database...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mg-text text-center">
          <p>Access denied. Please log in to view this page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mb-6">
        <h1 className="mg-title text-2xl md:text-3xl">Fleet Database</h1>
        <p className="mg-text text-sm opacity-80">
          View and manage your fleet information and assets
        </p>
      </div>
      
      <MobiGlasPanel className="p-4">
        <div className="text-center py-10">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="mg-subtitle text-xl mb-2">Fleet Database Coming Soon</h2>
          <p className="mg-text max-w-md mx-auto">
            Our Fleet Database system is currently under development. 
            Check back soon for comprehensive fleet management tools.
          </p>
        </div>
      </MobiGlasPanel>
    </div>
  );
} 