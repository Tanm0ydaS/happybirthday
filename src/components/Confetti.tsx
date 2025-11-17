// src/components/Confetti.tsx
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = { trigger: boolean; count?: number };

export default function Confetti({ trigger, count = 16 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!trigger || !ref.current) return;
    const container = ref.current;
    const elements: HTMLElement[] = [];
    const palette = ["#FFB3C6", "#FFD6A5", "#FDE68A", "#C7F9CC", "#D6E4FF", "#FFB7E6"];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.left = `${50 + (Math.random() - 0.5) * 60}%`;
      el.style.top = `${10 + Math.random() * 10}%`;
      el.style.width = `${6 + Math.random() * 8}px`;
      el.style.height = el.style.width;
      el.style.borderRadius = "3px";
      el.style.background = palette[Math.floor(Math.random() * palette.length)];
      el.style.transform = "translate3d(0,0,0)";
      el.style.willChange = "transform, opacity";
      container.appendChild(el);
      elements.push(el);
    }

    const tl = gsap.timeline({ defaults: { duration: 1.3, ease: "power3.out" }, onComplete: () => elements.forEach((e) => e.remove()) });
    elements.forEach((el) => {
      const dx = (Math.random() - 0.5) * 350;
      const dy = 180 + Math.random() * 160;
      const rot = (Math.random() - 0.5) * 480;
      const delay = Math.random() * 0.2;
      tl.fromTo(el, { opacity: 0, y: -10, scale: 0.6 }, { opacity: 1, y: dy, x: dx, rotation: rot, scale: 1, delay }, 0);
    });

    return () => {
      tl.kill();
      elements.forEach((e) => e.remove());
    };
  }, [trigger, count]);

  return <div ref={ref} className="pointer-events-none absolute inset-0 z-40" />;
}
