// src/components/HeroCard.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import AnimatedCard from "./AnimatedCard";
import Confetti from "./Confetti";
import MemorySlideshow from "./MemorySlideshow";
import NoteForm from "./NoteForm";
import MusicPlayer from "./MusicPlayer";
import PhotoStrip from "./PhotoStrip";
import NotesCard from "./NotesCard";

type HeroCardProps = {
  herName?: string;
  birthdate?: string;
};

export default function HeroCard({ herName = "Friend", birthdate = "Today" }: HeroCardProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardFrontRef = useRef<HTMLDivElement | null>(null);
  const cardInnerRef = useRef<HTMLDivElement | null>(null);
  const petalLayerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Entrance animations + floating petals
  useEffect(() => {
    if (prefersReducedMotion) {
      if (rootRef.current) rootRef.current.style.opacity = "1";
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(rootRef.current, { autoAlpha: 0, y: 16, duration: 0.8 })
        .from(rootRef.current!.querySelectorAll(".stagger-in"), { y: 14, opacity: 0, stagger: 0.08, duration: 0.7 }, "-=0.55")
        .to(cardFrontRef.current, { y: -6, duration: 1.6, ease: "sine.inOut" }, 0);

      // slow float on front for life
      if (cardFrontRef.current) {
        gsap.to(cardFrontRef.current, { y: -6, duration: 6, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }
    }, rootRef);

    // petals
    const petalEls: HTMLElement[] = [];
    const petalCount = 8;
    for (let i = 0; i < petalCount; i++) {
      const el = document.createElement("div");
      el.className = "will-change-transform";
      el.style.position = "absolute";
      const size = 14 + Math.round(Math.random() * 16);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${10 + Math.random() * 80}%`;
      el.style.top = `${8 + Math.random() * 28}%`;
      el.style.opacity = `${0.28 + Math.random() * 0.6}`;
      el.style.borderRadius = "40%";
      el.style.background = `linear-gradient(135deg, rgba(255,182,193,0.92), rgba(255,218,185,0.86))`;
      petalLayerRef.current?.appendChild(el);
      petalEls.push(el);
    }
    const petalTl = gsap.timeline({ repeat: -1 });
    petalEls.forEach((el, i) => {
      petalTl.to(el, { y: 26 + Math.random() * 24, x: (Math.random() - 0.5) * 28, rotation: Math.random() * 360, duration: 6 + Math.random() * 8 }, i * 0.2);
    });

    return () => {
      ctx.revert();
      petalEls.forEach((el) => el.remove());
      petalTl.kill();
    };
  }, [prefersReducedMotion]);

  // When opened: try to play audio and fire confetti
  useEffect(() => {
    if (!open) return;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        /* autoplay may be blocked; user can play via MusicPlayer */
      });
    }

    setConfettiTrigger(true);
    const t = setTimeout(() => setConfettiTrigger(false), 1500);
    return () => clearTimeout(t);
  }, [open]);

  const handleOpen = () => {
    if (open) return;
    setOpen(true);

    // Reduced-motion users: reveal immediately
    if (prefersReducedMotion) {
      if (cardFrontRef.current) cardFrontRef.current.style.display = "none";
      if (cardInnerRef.current) {
        cardInnerRef.current.style.opacity = "1";
        const first = cardInnerRef.current.querySelector<HTMLElement>("button, a, [tabindex]:not([tabindex='-1'])");
        if (first) first.focus();
      }
      return;
    }

    // 3D open animation: flap + inner reveal
    const front = cardFrontRef.current;
    const inner = cardInnerRef.current;
    if (!front || !inner) return;

    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power3.out" } });
    tl.to(front, { transformOrigin: "top center", rotateX: -150, y: -8, boxShadow: "0px 40px 90px rgba(0,0,0,0.18)" })
      .fromTo(inner, { autoAlpha: 0, y: 18, scale: 0.994 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 }, "-=0.3")
      .to(front, { autoAlpha: 0.95 }, "<");

    // little heart pop
    gsap.fromTo(rootRef.current!.querySelectorAll(".heart-pop"), { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.06, duration: 0.45, ease: "back.out(3)" });

    // focus inner content after animation
    tl.call(() => {
      const f = inner.querySelector<HTMLElement>("button, a, [tabindex]:not([tabindex='-1'])");
      if (f) f.focus();
    }, null, "+=0.06");
  };

  // gentle parallax on desktop mouse move
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMove = (e: MouseEvent) => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = (e.clientX - cx) / rect.width;
      const ry = (e.clientY - cy) / rect.height;
      gsap.to(rootRef.current, { "--rx": `${rx * 6}deg`, "--ry": `${ry * 6}deg`, duration: 0.8, ease: "power2.out" } as any);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // slideshow data (replace with your images)
  const slides = [
    { src: "/images/1.jpg", caption: "That day we laughed until our stomachs hurt." },
    { src: "/images/2.jpg", caption: "Soft rain, hot coffee and your smile." },
    { src: "/images/3.jpg", caption: "Tiny moments that mean everything." },
  ];

  return (
    <main ref={rootRef} className="min-h-screen px-4 sm:px-6 lg:px-12 py-8 hero-padding relative" style={{ transformStyle: "preserve-3d" }}>
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-gray-500 mb-2 stagger-in">A little surprise — watch it and let me know your thoughts</p>
        <h1 className="stagger-in font-display text-4xl sm:text-5xl md:text-6xl leading-tight">
          Happy Birthday, <span style={{ color: "var(--accent)" }}>{herName}</span>
        </h1>
        <div className="mt-3 stagger-in text-sm text-gray-600">{birthdate}</div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT: card + slideshow */}
        <div className="relative">
          <div ref={petalLayerRef} className="absolute inset-0 pointer-events-none z-0" />

          <div className="mx-auto w-full max-w-xl z-10 relative">
            <div className="relative w-full h-[380px] md:h-[420px]">
              {/* Card inner (revealed area) - ensure high z so it's above backdrop */}
              <div
                ref={cardInnerRef}
                className="absolute inset-0 rounded-2xl bg-white shadow-lg z:80 overflow-hidden transform-gpu"
                style={{ opacity: open ? 1 : 0, backfaceVisibility: "hidden" }}
                aria-hidden={!open}
              >
                <AnimatedCard open={open} message={`Happy birthday ${herName}! Even though we're far, I'm right there in the memories.`} name={herName} />
              </div>

              {/* Card front flap - keep highest z so click opens reliably */}
              <div
                ref={cardFrontRef}
                className="absolute inset-0 rounded-2xl bg-linear-to-br from-pink-200 to-pink-100 shadow-2xl flex flex-col items-center justify-center p-6 z:80 transform-gpu"
                style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
              >
                <div className="text-center">
                  <h3 className="text-xl font-display mb-2">For {herName}</h3>
                  <p className="text-sm text-gray-600">Tap to open — a small wish for you</p>
                </div>

                <button
                  onClick={handleOpen}
                  className="mt-6 bg-white text-pink-600 px-6 py-2 rounded-full font-medium shadow-lg hover:scale-102 active:scale-98 transition-transform"
                  type="button"
                >
                  Open your surprise
                </button>

                <div className="absolute -top-6 right-6 opacity-0" aria-hidden>
                  <svg className="w-8 h-8 heart-pop" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21s-7-4.5-9.5-8C0.5 8.5 4 4 8 5.5 10 6.5 12 9 12 9s2-2.5 4-3.5C20 4 23.5 8.5 21.5 13 19 16.5 12 21 12 21z" fill="#ff5978" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-6 h-2 w-64 mx-auto rounded-full bg-linear-to-r from-transparent via-gray-300 to-transparent opacity-25 blur-sm" />
          </div>

          <div className="mt-8">
            <MemorySlideshow items={slides} intervalMs={4800} autoplay showControls />
          </div>
        </div>

        {/* RIGHT: notes, music, recent notes */}
        <aside className="w-full">
          <div className="sticky top-6">
            <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
              <h4 className="text-lg font-semibold mb-2">Leave a little note</h4>
              <NoteForm />
            </div>

            <div className="mt-6">
              <div className="bg-white/95 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
                <h4 className="text-sm font-semibold">Our little tune</h4>
                <MusicPlayer src="/audio/bday.mp3" title={`For ${herName} — our tune`} />
              </div>
            </div>

            <div className="mt-6">
              <NotesCard />
            </div>

            <div className="mt-6 text-xs text-gray-500">Tip: best experienced on mobile portrait. Tap the card and enjoy the little surprise 💌</div>
          </div>
        </aside>
      </div>

      {/* Hidden audio used for immediate open-play attempt */}
      <audio ref={audioRef} className="hidden" src="/audio/bday.mp3" preload="auto" />

      {/* confetti burst - earlier confetti uses z 40; card is z 70/80 so card stays on top */}
      <Confetti trigger={confettiTrigger} />

      {/* modal backdrop - inline style ensures it sits behind the card */}
      {open && <div className="modal-backdrop" aria-hidden style={{ zIndex: 30 }} />}
    </main>
  );
}
