"use client";

import React from "react";

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
  const dims = sizeMap[size];
  return (
    <div
      aria-hidden={false}
      className={`relative overflow-hidden rounded-md border border-[rgba(var(--mg-primary),0.25)] bg-[rgba(var(--mg-panel-dark),0.4)] ${dims.className} ${className || ""}`}
      style={{ contain: "layout paint" }}
    >
      <div className="flex items-center justify-center w-full h-full bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.15)] rounded">
        <span className="text-xs text-[rgba(var(--mg-primary),0.3)]">No image</span>
      </div>
    </div>
  );
};

export default ShipImage;
