"use client";

import Image from "next/image";
import React from "react";
import { resolveShipImage } from "@/lib/ships/image";

export type ShipImageSize = "sm" | "md" | "lg";

const sizeMap: Record<ShipImageSize, { w: number; h: number; className: string }> = {
  sm: { w: 96, h: 64, className: "w-[96px] h-[64px]" }, // ~3:2
  md: { w: 144, h: 96, className: "w-[144px] h-[96px]" },
  lg: { w: 216, h: 144, className: "w-[216px] h-[144px]" },
};

interface ShipImageProps {
  model: string;
  alt?: string;
  size?: ShipImageSize;
  className?: string;
}

const ShipImage: React.FC<ShipImageProps> = ({ model, alt, size = "sm", className }) => {
  const src = resolveShipImage(model);
  const dims = sizeMap[size];
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div
      aria-hidden={false}
      className={`relative overflow-hidden rounded-md border border-[rgba(var(--mg-primary),0.25)] bg-[rgba(var(--mg-panel-dark),0.4)] ${dims.className} ${className || ""}`}
      style={{ contain: "layout paint" }}
    >
      {/* Skeleton */}
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[rgba(255,255,255,0.04)]" />}
      <Image
        src={src}
        alt={alt || `${model} image`}
        fill
        sizes={`${dims.w}px`}
        loading="lazy"
        className="object-cover"
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
};

export default ShipImage;
