'use client';

import React from 'react';
import ShipBrowsePage from '@/components/ships/ShipBrowsePage';

/**
 * Client component wrapper for the Fleet Database page.
 *
 * Renders the ShipBrowsePage orchestrator which manages all state
 * and sub-components for the ship browsing experience.
 */
export default function FleetDatabaseClient() {
  return <ShipBrowsePage />;
}
