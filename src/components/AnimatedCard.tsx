// src/components/AnimatedCard.tsx
"use client";

import React, { useEffect, useState } from "react";

type Props = {
  open: boolean;
  message?: string;
  name?: string;
};

export default function AnimatedCard({ open, message = "Happy Birthday! I hope your day is filled with smiles.", name = "You" }: Props) {
  const [visibleText, setVisibleText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisibleText("");
      setDone(false);
      return;
    }
    let i = 0;
    setVisibleText("");
    setDone(false);
    const speed = 26;
    const t = setInterval(() => {
      i += 1;
      setVisibleText(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(t);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(t);
  }, [open, message]);

  return (
    <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center">
      <div className="mb-3">
        <h2 className="text-2xl font-display">Happy Birthday, {name}!</h2>
        <div className="text-xs text-gray-500 mt-1">A small heart from far away</div>
      </div>

      <div className="prose max-w-none text-sm text-gray-700">
        <p>{visibleText}</p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div aria-hidden className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform-gpu transition-all ${done ? "scale-105" : "scale-100"}`} style={{ background: "linear-gradient(135deg, rgba(255,182,193,0.95), rgba(255,218,185,0.95))" }}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.5-9.5-8C0.5 8.5 4 4 8 5.5 10 6.5 12 9 12 9s2-2.5 4-3.5C20 4 23.5 8.5 21.5 13 19 16.5 12 21 12 21z" fill="#ff5978"/></svg>
        </div>
        <div className="text-xs text-gray-500">{done ? "Sent with love" : "Reading..."}</div>
      </div>
    </div>
  );
}
