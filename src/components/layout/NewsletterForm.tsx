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
    <div className="w-full">
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="footer-newsletter" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 rounded-full border border-purple-300/40 bg-white/10 px-4 py-2 text-xs sm:text-sm text-white placeholder:text-purple-300/60 outline-none transition focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider text-purple-950 transition shadow-sm disabled:opacity-60"
        >
          {pending ? "…" : "Join"}
        </button>
      </form>
      {status === "ok" && <p className="mt-2 text-xs text-emerald-400">Thank you — welcome to our loom circle.</p>}
      {status === "already" && <p className="mt-2 text-xs text-amber-300">You are already on our weaver circle.</p>}
      {status === "err" && <p className="mt-2 text-xs text-rose-400">Something went wrong. Please try again.</p>}
    </div>
  );
}
