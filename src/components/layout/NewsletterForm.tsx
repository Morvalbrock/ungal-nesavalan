"use client";
import { useState, useTransition } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "already" | "err">("idle");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" })
      });
      if (!res.ok) {
        setStatus("err");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { alreadySubscribed?: boolean };
      setStatus(data.alreadySubscribed ? "already" : "ok");
      setEmail("");
    });
  }

  return (
    <div className="mt-6">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Loom notes</p>
      <p className="mt-2 text-sm text-ink-muted">A short letter, once a fortnight.</p>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <label htmlFor="footer-newsletter" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-full border border-border bg-cream px-4 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-4 py-2 text-xs uppercase tracking-wider text-cream disabled:opacity-60"
        >
          {pending ? "…" : "Join"}
        </button>
      </form>
      {status === "ok" && <p className="mt-2 text-xs text-emerald-700">Thank you — check your inbox for a welcome note.</p>}
      {status === "already" && <p className="mt-2 text-xs text-ink-muted">You're already on the list.</p>}
      {status === "err" && <p className="mt-2 text-xs text-maroon">Something went wrong. Try again.</p>}
    </div>
  );
}
