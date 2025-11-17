// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";

type Note = {
  id: string;
  name?: string | null;
  message: string;
  createdAt: string;
  reply?: string | null;
};

export default function AdminPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/notes");
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `API returned ${res.status}`);
        }
        const data = (await res.json()) as Note[];
        if (!cancelled) setNotes(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load notes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin — Notes</h1>

      {loading && <div className="text-sm text-gray-600">Loading notes…</div>}
      {error && <div className="text-sm text-red-600 mb-4">Error: {error}</div>}

      {!loading && notes.length === 0 && !error && (
        <div className="text-sm text-gray-500">No notes yet.</div>
      )}

      <ul className="space-y-4 mt-4">
        {notes.map((n) => (
          <li key={n.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                <div className="font-medium">{n.name ?? "Anon"}</div>
              </div>
            </div>

            <div className="mt-2 text-sm whitespace-pre-wrap">{n.message}</div>

            {n.reply && <div className="mt-3 text-sm text-pink-600">Reply: {n.reply}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
