'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import TestShipImages from '@/components/fleet-ops/mission-planner/TestShipImages';

export default function TestShipsPage() {
  // Block access in production
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ship Image Testing Page</h1>
      <TestShipImages />
    </div>
  );
} 