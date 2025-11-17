// src/components/MusicPlayer.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type MusicPlayerProps = {
  src?: string;
  title?: string;
};

export default function MusicPlayer({ src = "/audio/bday.mp3", title = "Our tune" }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (!audio.duration || Number.isNaN(audio.duration)) return;
      setProgress((audio.currentTime / Math.max(0.0001, audio.duration)) * 100);
    };
    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (audio.paused) {
      try {
        audio.volume = 0;
        await audio.play();
        setPlaying(true);
        const fadeDur = prefersReducedMotion ? 0.08 : 1.1;
        gsap.to(audio, { volume: muted ? 0 : 1, duration: fadeDur, ease: "power2.out" });
      } catch {
        setPlaying(false);
      }
    } else {
      const fadeDur = prefersReducedMotion ? 0.08 : 0.5;
      gsap.to(audio, { volume: 0, duration: fadeDur, onComplete: () => { audio.pause(); audio.currentTime = 0; setPlaying(false); } });
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pos * (audio.duration || 0);
    setProgress(pos * 100);
  };

  return (
    <div className="px-0">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="bg-white rounded-2xl p-2 shadow flex items-center gap-3">
        <button onClick={toggle} aria-pressed={playing} aria-label={playing ? "Pause" : "Play"} className="w-12 h-12 rounded-full grid place-items-center bg-pink-100 text-pink-600 shadow-sm" type="button">
          {playing ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3v18l15-9L5 3z" /></svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium truncate">{title}</div>
            <button onClick={toggleMute} className="text-xs text-gray-500 ml-2" type="button">{muted ? "Muted" : "Sound"}</button>
          </div>

          <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer" onClick={onSeek} aria-label="Seek">
            <div className="h-full bg-pink-300 rounded-full" style={{ width: `${progress}%`, transition: "width 0.12s linear" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
