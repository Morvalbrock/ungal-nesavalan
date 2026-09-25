"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  productSlug: string;
}

export function ReviewForm({ productSlug }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shown = hover ?? rating;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title: title.trim(), body: body.trim() })
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(errorMessage(data.error));
        return;
      }
      setTitle("");
      setBody("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-card border border-border bg-cream-warm p-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-muted">Your rating</p>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onClick={() => setRating(i)}
              aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
              className="rounded p-1"
            >
              <Star className={cn("h-6 w-6", i <= shown ? "fill-amber-500 text-amber-500" : "text-ink-muted/40")} />
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Headline</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
          placeholder="e.g. Silk that draped beautifully"
          className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Your review</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          minLength={10}
          maxLength={2000}
          rows={4}
          required
          placeholder="Share the fit, the fabric, how it felt on the day."
          className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>

      {error && <p className="text-sm text-maroon">{error}</p>}

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-ink-muted">Reviews are verified — only buyers can post.</p>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Publishing…" : "Publish review"}
        </button>
      </div>
    </form>
  );
}

function errorMessage(code: string | undefined): string {
  switch (code) {
    case "already_reviewed": return "You've already reviewed this saree.";
    case "not_eligible": return "Only buyers of this saree can post a review.";
    case "invalid_input": return "Please fill in the rating, title (2+ chars), and body (10+ chars).";
    case "unauthorized": return "Please sign in to post a review.";
    default: return "Couldn't post your review. Please try again.";
  }
}
