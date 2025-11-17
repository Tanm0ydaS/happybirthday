// src/components/MemorySlideshow.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";

type Slide = { src: string; alt?: string; caption?: string };
type Props = { items: Slide[]; intervalMs?: number; autoplay?: boolean; showControls?: boolean };

export default function MemorySlideshow({
  items,
  intervalMs = 4800,
  autoplay = true,
  showControls = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState("");
  const slidesRef = useRef<HTMLDivElement[]>([]);
  const touchStartX = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // reset references each render
  slidesRef.current = [];

  const addRef = (el: HTMLDivElement | null) => {
    if (el) slidesRef.current.push(el);
  };

  // initialize slide DOM states and start typing for first slide
  useEffect(() => {
    slidesRef.current.forEach((el, i) => {
      gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, zIndex: i === 0 ? 20 : 10 });
    });
    startTyping(items[0]?.caption || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autoplay loop
  useEffect(() => {
    if (!autoplay || prefersReducedMotion) return;
    intervalRef.current = window.setInterval(() => {
      goNext();
    }, intervalMs);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, autoplay, prefersReducedMotion]);

  // navigate to slide i with GSAP crossfade
  const goTo = (i: number) => {
    if (i === index) return;
    const prev = slidesRef.current[index];
    const next = slidesRef.current[i];
    if (!prev || !next) return;

    const tl = gsap.timeline();
    tl.set(next, { autoAlpha: 1, zIndex: 20 })
      .to(prev, { autoAlpha: 0, zIndex: 10, duration: 0.6, ease: "power2.out" }, 0)
      .fromTo(next, { scale: 1.03 }, { scale: 1, duration: 0.9, ease: "power3.out" }, 0);

    setIndex(i);
    startTyping(items[i].caption || "");
  };

  const goPrev = () => goTo((index - 1 + items.length) % items.length);
  const goNext = () => goTo((index + 1) % items.length);

  // typewriter effect for captions
  function startTyping(text: string) {
    setTyping("");
    if (!text) return;
    let i = 0;
    const speed = Math.max(10, 28 - Math.floor(text.length / 6)); // adapt speed by text length
    const t = setInterval(() => {
      i += 1;
      setTyping(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
  }

  // touch handling for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 30) goPrev();
    else if (dx < -30) goNext();
    touchStartX.current = null;
  };

  // responsive sizes hint for next/image:
  // - 100vw for small screens, narrower for larger breakpoints
  // sizes string tells the browser which image size it should request
  const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 900px";

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className="relative rounded-xl overflow-hidden bg-gray-100"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-roledescription="carousel"
      >
        {items.map((it, i) => (
          <div
            key={i}
            ref={(el) => el && addRef(el)}
            className="absolute inset-0 w-full h-[260px] sm:h-[340px] md:h-[420px] flex items-center justify-center"
            style={{ willChange: "transform, opacity" }}
            aria-hidden={i !== index}
          >
            {/* Next/Image in 'fill' mode for perfect cover behavior */}
            <div className="relative w-full h-full">
              <Image
                src={it.src}
                alt={it.alt ?? it.caption ?? `slide-${i + 1}`}
                fill
                sizes={sizes}
                priority={i === 0}
                style={{ objectFit: "cover" }}
                decoding={i === 0 ? "eager" : "async"}
              />
            </div>
          </div>
        ))}

        {/* caption overlay */}
        <div className="absolute left-4 right-4 bottom-4 bg-black/40 backdrop-blur-sm text-white p-3 rounded-lg pointer-events-none">
          <div className="text-sm sm:text-base leading-snug">{typing}</div>
        </div>

        {/* controls */}
        {showControls && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-sm"
              type="button"
            >
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none">
                <path d="M15 6L9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={goNext}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-sm"
              type="button"
            >
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {/* indicators */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-2 pointer-events-auto">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/60"}`}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
