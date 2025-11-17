// src/app/admin/page.tsx
import React, { useEffect, useState } from "react";

type Note = { id: string; name: string | null; message: string; createdAt: string; reply?: string | null };

export default function AdminPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  useEffect(() => {
    fetch("http://localhost:4000/notes")
      .then((r) => r.json())
      .then(setNotes)
      .catch(console.error);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">Notes</h1>
      <div className="space-y-4">
        {notes.map((n) => (
          <div key={n.id} className="bg-white p-4 rounded-lg shadow">
            <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
            <div className="font-semibold">{n.name || "Anon"}</div>
            <div className="mt-2">{n.message}</div>
            {n.reply && <div className="mt-2 text-sm text-pink-600">Reply: {n.reply}</div>}
          </div>
        ))}
      </div>
    </main>
  );
}
