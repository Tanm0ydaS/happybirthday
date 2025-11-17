// src/components/NoteForm.tsx (update)
"use client";
import React, { useState } from "react";

export default function NoteForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!message.trim()) { setStatus({ ok: false, msg: "Please write a message." }); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || null, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      if (data.emailSent) setStatus({ ok: true, msg: "Note saved & emailed — thank you!" });
      else setStatus({ ok: true, msg: "Note accepted but email sending failed (check server)." });
      setName(""); setMessage("");
    } catch (err) {
      setStatus({ ok: false, msg: "Network or server error — try again." });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <label className="text-xs text-gray-500">Your name (optional)</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Barnita" maxLength={64} />
      <label className="text-xs text-gray-500">Message</label>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm h-28" placeholder="Write something sweet..." maxLength={2000} />
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">{message.length}/2000</div>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-full bg-pink-500 text-white text-sm shadow">
          {loading ? "Sending…" : "Send note"}
        </button>
      </div>
      {status && <div className={`mt-3 text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>{status.msg}</div>}
    </form>
  );
}
