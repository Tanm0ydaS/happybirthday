// src/pages/api/notes.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

type NoteRequest = {
  name?: string | null;
  message: string;
};

type ApiResp = {
  ok: boolean;
  error?: string;
  emailSent?: boolean;
};

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const body = req.body as NoteRequest;
  if (!body || typeof body.message !== "string" || body.message.trim().length === 0) {
    return res.status(400).json({ ok: false, error: "Message is required" });
  }

  const name = body.name && String(body.name).trim().length ? String(body.name).trim().slice(0, 64) : "Anonymous";
  const message = String(body.message).trim().slice(0, 2000);
  const createdAt = new Date().toISOString();

  // Email sending
  const transporter = createTransporter();
  if (!transporter) {
    return res.status(500).json({ ok: false, error: "SMTP not configured on server" });
  }

  const emailTo = process.env.EMAIL_TO;
  const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!emailTo) return res.status(500).json({ ok: false, error: "EMAIL_TO not configured" });

  const subject = `New note from ${name}`;
  const text = `New note received\n\nFrom: ${name}\nTime: ${createdAt}\n\n${message}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color:#222">
      <h2>New note from ${escapeHtml(name)}</h2>
      <div style="font-size:12px;color:#666">${new Date(createdAt).toLocaleString()}</div>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      <hr />
      <small style="color:#999">Sent from your birthday site</small>
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
    // success
    return res.status(201).json({ ok: true, emailSent: true });
  } catch (err: any) {
    console.error("Error sending email:", err);
    return res.status(500).json({ ok: false, error: `Email send failed: ${err?.message || err}`, emailSent: false });
  }
}
