'use client';

import React from 'react';
import type { ShipDocument } from '@/types/ship';
import {
  formatDimensions,
  formatCrew,
  formatCargo,
  formatSpeed,
  formatProductionStatus,
  formatSize,
} from '@/lib/ships/format';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShipSpecsProps {
  ship: ShipDocument;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShipSpecs({ ship }: ShipSpecsProps) {
  const specs: { label: string; value: string }[] = [
    { label: 'Size', value: formatSize(ship.size) },
    {
      label: 'Classification',
      value: ship.classificationLabel || ship.classification || 'N/A',
    },
    { label: 'Focus', value: ship.focus || 'N/A' },
    { label: 'Status', value: formatProductionStatus(ship.productionStatus) },
    { label: 'Crew', value: formatCrew(ship.crew.min, ship.crew.max) },
    { label: 'Cargo', value: formatCargo(ship.cargo) },
    {
      label: 'Dimensions',
      value: formatDimensions(ship.length, ship.beam, ship.height),
    },
    {
      label: 'Mass',
      value: ship.mass > 0 ? `${ship.mass.toLocaleString()} kg` : 'N/A',
    },
    { label: 'SCM Speed', value: formatSpeed(ship.scmSpeed) },
    {
      label: 'Pledge Price',
      value: ship.pledgePrice ? `$${ship.pledgePrice}` : 'N/A',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Manufacturer Badge */}
      <div className="flex items-center gap-2">
        <span className="bg-[rgba(var(--mg-primary),0.1)] text-[rgba(var(--mg-primary),0.8)] px-2 py-0.5 text-xs font-mono rounded-sm">
          {ship.manufacturer.code}
        </span>
        <span className="text-[rgba(var(--mg-text),0.7)] text-sm">
          {ship.manufacturer.name}
        </span>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {specs.map(({ label, value }) => (
          <div key={label}>
            <div className="text-[rgba(var(--mg-text),0.5)] text-xs uppercase tracking-wider">
              {label}
            </div>
            <div className="text-[rgba(var(--mg-text),0.9)] text-sm">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
