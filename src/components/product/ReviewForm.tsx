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
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-purple-100 bg-white p-6 shadow-xs">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-purple-900/70">Your Rating</p>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onClick={() => setRating(i)}
              aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
              className="rounded p-1 transition hover:scale-110"
            >
              <Star className={cn("h-6 w-6", i <= shown ? "fill-amber-400 text-amber-400" : "text-purple-200")} />
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">Review Headline</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
          placeholder="e.g. Luminous pure silk, breathtaking zari fall"
          className="w-full rounded-xl border border-purple-200 bg-purple-50/20 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">Your Review</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          minLength={10}
          maxLength={2000}
          rows={4}
          required
          placeholder="Share your experience with the drape, texture, colour vibrancy, and loom craft."
          className="w-full rounded-xl border border-purple-200 bg-purple-50/20 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20"
        />
      </label>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-purple-900/60">Verified weaver reviews only.</p>
        <button type="submit" disabled={pending} className="btn-primary font-semibold">
          {pending ? "Publishing…" : "Submit Review"}
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
