'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import FleetDatabaseClient from './FleetDatabaseClient';

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
      <FleetDatabaseClient />
    </div>
  );
} 