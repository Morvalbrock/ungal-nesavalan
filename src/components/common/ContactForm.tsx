"use client";
import { useState, useTransition } from "react";

const inputCls =
  "w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink";

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
      <div className="rounded-card border border-border bg-cream-warm p-6">
        <p className="font-display text-xl text-ink">Thank you — we've got your note.</p>
        <p className="mt-2 text-sm text-ink-muted">
          We reply within one working day. If it's about a live order, quote the order number in your next message.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-card border border-border bg-cream-warm p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={120} className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          className={inputCls}
        />
      </label>
      {error && <p className="text-sm text-maroon">{error}</p>}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-ink-muted">We reply within one working day.</p>
        <button type="submit" disabled={pending} className="btn-primary whitespace-nowrap">
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
