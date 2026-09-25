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
      <div className="rounded-card border border-border bg-cream-warm p-5 text-sm">
        <p className="font-medium text-ink">Thanks — your question is with our team.</p>
        <p className="mt-1 text-ink-muted">We publish the answer here within one working day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-card border border-border bg-cream-warm p-5">
      {!signedIn && (
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Your name (optional)</span>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
            placeholder="Anonymous"
            className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Ask a question</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          minLength={10}
          maxLength={1000}
          rows={3}
          required
          placeholder="Is the pallu contrast? What's the exact zari colour?"
          className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      {error && <p className="text-sm text-maroon">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-ink-muted">We answer within one working day.</p>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Sending…" : "Ask"}
        </button>
      </div>
    </form>
  );
}
