'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import FleetOpsDashboard from '@/components/fleet-ops/FleetOpsDashboard';
import MobiGlasPanel from '@/components/MobiGlasPanel';

export default function FleetOperationsPage() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mg-text text-center">
          <div className="mg-loader"></div>
          <p className="mt-4">Loading Fleet Operations...</p>
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
        <h1 className="mg-title text-2xl md:text-3xl">Operations</h1>
        <p className="mg-text text-sm opacity-80">
          Plan, manage, and track fleet operations for AydoCorp
        </p>
      </div>
      
      <MobiGlasPanel className="p-4">
        <FleetOpsDashboard session={session} />
      </MobiGlasPanel>
    </div>
  );
} 