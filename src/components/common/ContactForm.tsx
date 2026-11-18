"use client";
import { useState, useTransition } from "react";

const inputCls =
  "w-full rounded-xl border border-purple-200 bg-purple-50/20 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus("err");
        setError(data.error === "invalid_input" ? "Please fill every field." : "Something went wrong. Try again.");
        return;
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    });
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50/80 p-8 text-center shadow-xs">
        <h3 className="font-heritage text-2xl font-bold text-brand-plum">Thank You — Note Received</h3>
        <p className="mt-2 text-sm text-purple-900/70">
          Our weaver care team replies within one business day. For urgent bridal inquiries, WhatsApp +91 88258 10897.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-purple-100 bg-white p-6 sm:p-8 shadow-xs">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">Your Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} placeholder="Priya" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">Email Address</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="priya@example.com" className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={120} placeholder="Custom weave inquiry, order query, bulk gifting…" className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          placeholder="Tell us about the drape or query you need assistance with…"
          className={inputCls}
        />
      </label>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <p className="text-xs text-purple-900/60">We reply within 24 hours.</p>
        <button type="submit" disabled={pending} className="btn-primary whitespace-nowrap font-semibold">
          {pending ? "Sending…" : "Send Message →"}
        </button>
      </div>
    </form>
  );
}
