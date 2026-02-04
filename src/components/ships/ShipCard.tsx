'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import MobiGlasPanel from '@/components/ui/mobiglas/MobiGlasPanel';
import { resolveShipImage } from '@/lib/ships/image';
import type { ShipDocument } from '@/types/ship';

interface ShipCardProps {
  ship: ShipDocument;
  onClick: (ship: ShipDocument) => void;
}

export default function ShipCard({ ship, onClick }: ShipCardProps) {
  const [imgSrc, setImgSrc] = useState(() => resolveShipImage(ship.images, 'store'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={() => onClick(ship)}
    >
      <MobiGlasPanel
        variant="dark"
        cornerAccents={true}
        cornerSize="sm"
        padding="sm"
        className="h-full"
      >
        {/* Ship Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm mb-3">
          <Image
            src={imgSrc}
            alt={ship.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            loading="lazy"
            onError={() => setImgSrc('/assets/ship-placeholder.png')}
          />
        </div>

        {/* Ship Info */}
        <div className="space-y-1.5">
          <h3 className="text-[rgba(var(--mg-primary),0.9)] font-quantify text-sm truncate">
            {ship.name}
          </h3>
          <p className="text-[rgba(var(--mg-text),0.6)] text-xs truncate">
            {ship.manufacturer.name}
          </p>
          {ship.classificationLabel && (
            <span className="inline-block bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),0.7)] text-xs px-1.5 py-0.5 rounded-sm">
              {ship.classificationLabel}
            </span>
          )}
        </div>
      </MobiGlasPanel>
    </motion.div>
  );
}
