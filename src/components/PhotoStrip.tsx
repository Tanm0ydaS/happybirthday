// src/components/PhotoStrip.tsx
"use client";

import React from "react";

type Props = { images: string[]; altPrefix?: string };

export default function PhotoStrip({ images, altPrefix = "memory" }: Props) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm text-gray-600 mb-3 px-4">Memories</h3>
      <div className="photo-strip snap-x snap-mandatory overflow-x-auto no-scrollbar px-4 pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-4">
          {images.map((src, i) => (
            <div key={i} className="snap-start shrink-0 w-64 h-40 rounded-xl overflow-hidden bg-white shadow-md" role="img" aria-label={`${altPrefix} ${i+1}`}>
              <img src={src} alt={`${altPrefix} ${i+1}`} className="w-full h-full object-cover block" decoding="async" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
