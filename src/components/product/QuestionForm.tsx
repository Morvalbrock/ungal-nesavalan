"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  productSlug: string;
  signedIn: boolean;
}

export function QuestionForm({ productSlug, signedIn }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/products/${productSlug}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signedIn ? { body } : { body, authorName: authorName.trim() || undefined })
      });
      if (!res.ok) {
        setStatus("err");
        setError("Please write a longer question (at least 10 characters).");
        return;
      }
      setStatus("ok");
      setBody("");
      setAuthorName("");
      router.refresh();
    });
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-5 text-sm text-purple-950">
        <p className="font-bold text-brand-plum">Thank you — your question is with our weavers.</p>
        <p className="mt-1 text-xs text-purple-900/70">Our artisans answer within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-purple-100 bg-white p-6 shadow-xs">
      {!signedIn && (
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">Your Name (Optional)</span>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
            placeholder="e.g. Priyadarshini"
            className="w-full rounded-xl border border-purple-200 bg-purple-50/20 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20"
          />
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">Ask About This Handloom Saree</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          minLength={10}
          maxLength={1000}
          rows={3}
          required
          placeholder="e.g. Is the pallu contrast? Can you share the approximate drape weight?"
          className="w-full rounded-xl border border-purple-200 bg-purple-50/20 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20"
        />
      </label>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-purple-900/60">Replied directly by loom experts.</p>
        <button type="submit" disabled={pending} className="btn-primary font-semibold">
          {pending ? "Submitting…" : "Post Question"}
        </button>
      </div>
    </form>
  );
}
