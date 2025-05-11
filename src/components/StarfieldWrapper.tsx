'use client';

import dynamic from 'next/dynamic';

const DynamicMobiGlassStarfield = dynamic(() => import('./Starfield'), {
  ssr: false
});

export default function StarfieldWrapper() {
  return <DynamicMobiGlassStarfield />;
} 