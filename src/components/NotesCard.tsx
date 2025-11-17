// src/components/NotesCard.tsx
"use client";

import React, { useEffect, useState } from "react";

type Note = { id: string; name: string | null; message: string; createdAt: string; reply?: string | null };

export default function NotesCard() {
  const [notes, setNotes] = useState<Note[]>([]);
  useEffect(() => {
    fetch("http://localhost:4000/notes").then((r) => r.json()).then(setNotes).catch(() => {});
  }, []);

  return (
    <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
      <h4 className="text-sm font-semibold mb-2">Recent notes</h4>
      {notes.length === 0 ? <div className="text-xs text-gray-500">No notes yet — be the first to send one!</div> : (
        <ul className="space-y-3">
          {notes.slice(0, 5).map((n) => (
            <li key={n.id} className="border rounded-md p-3 bg-white">
              <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
              <div className="font-medium">{n.name || "Anon"}</div>
              <div className="mt-1 text-sm">{n.message}</div>
              {n.reply && <div className="mt-2 text-sm text-pink-600">Reply: {n.reply}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
