'use client';

import React from 'react';
import TestShipImages from '@/components/fleet-ops/mission-planner/TestShipImages';

export default function TestShipsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ship Image Testing Page</h1>
      <TestShipImages />
    </div>
  );
} 