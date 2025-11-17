// server/index.ts
import express, { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: "6mb" }));

const DATA_DIR = path.join(__dirname, "data");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");

// Note type
type Note = {
  id: string;
  name: string | null;
  message: string;
  createdAt: string;
  reply?: string | null;
  emailSent?: boolean;
  emailError?: string | null;
};

// Ensure data folder & file
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(NOTES_FILE);
    } catch {
      await fs.writeFile(NOTES_FILE, "[]", "utf8");
    }
  } catch (err) {
    console.error("Error ensuring data file:", err);
  }
}
async function readNotes(): Promise<Note[]> {
  try {
    const raw = await fs.readFile(NOTES_FILE, "utf8");
    return JSON.parse(raw) as Note[];
  } catch (err) {
    console.error("readNotes error:", err);
    return [];
  }
}
async function writeNotes(notes: Note[]) {
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf8");
}

/**
 * Create and return a Nodemailer transporter from env.
 * If env is missing or invalid, returns null.
 */
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true", // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Send notification email about a new note.
 * Returns { ok: boolean, error?: string }
 */
async function sendNotificationEmail(note: Note) {
  const transporter = createTransporter();
  if (!transporter) {
    return { ok: false, error: "Missing SMTP config (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)." };
  }

  const emailTo = process.env.EMAIL_TO;
  const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!emailTo) {
    return { ok: false, error: "Missing EMAIL_TO environment variable." };
  }

  const subject = `New note from ${note.name ?? "Anonymous"} — ${new Date(note.createdAt).toLocaleString()}`;
  const text = [
    `You received a new note on your birthday site.`,
    ``,
    `From: ${note.name ?? "Anonymous"}`,
    `Time: ${note.createdAt}`,
    ``,
    `Message:`,
    note.message,
    ``,
    `--`,
    `Sent by the birthday site.`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #333;">
      <h2>New note from ${note.name ?? "Anonymous"}</h2>
      <div style="font-size: 13px; color: #666;">${new Date(note.createdAt).toLocaleString()}</div>
      <hr />
      <p style="white-space: pre-wrap; line-height: 1.4;">${escapeHtml(note.message)}</p>
      <hr />
      <p style="font-size:12px; color:#888;">This message was sent from your birthday site.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: emailFrom,
      to: emailTo,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (err: any) {
    console.error("Error sending mail:", err);
    return { ok: false, error: String(err?.message ?? err) };
  }
}

// very small helper to avoid raw HTML injection in the email body
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// GET /notes - list notes (most recent first)
app.get("/notes", async (_req: Request, res: Response) => {
  await ensureDataFile();
  const notes = await readNotes();
  res.json(notes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
});

// POST /notes - create a new note, store, and send email
app.post("/notes", async (req: Request, res: Response) => {
  await ensureDataFile();

  const { name, message } = req.body || {};

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  const trimmed = message.trim().slice(0, 2000);
  const safeName = name && String(name).trim().length > 0 ? String(name).trim().slice(0, 64) : null;

  const newNote: Note = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: safeName,
    message: trimmed,
    createdAt: new Date().toISOString(),
  };

  try {
    const notes = await readNotes();
    notes.push(newNote);
    await writeNotes(notes);
  } catch (err) {
    console.error("Error saving note:", err);
    return res.status(500).json({ error: "Failed to save note." });
  }

  // Try to send email but do not fail the request if email fails.
  const emailResult = await sendNotificationEmail(newNote);
  newNote.emailSent = !!emailResult.ok;
  newNote.emailError = emailResult.ok ? null : emailResult.error ?? "Unknown error";

  // Update the saved note with email status (optional)
  try {
    const notes = await readNotes();
    const idx = notes.findIndex((n) => n.id === newNote.id);
    if (idx !== -1) {
      notes[idx] = newNote;
      await writeNotes(notes);
    }
  } catch {
    // ignore write failure here
  }

  res.status(201).json({ ok: true, note: newNote, emailSent: newNote.emailSent, emailError: newNote.emailError });
});

// Small health check
app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "express server alive" });
});

app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`);
});
