import Link from "next/link";
import type { Review, ReviewAggregate } from "@/types/review";
import { RatingStars } from "./RatingStars";
import { ReviewForm } from "./ReviewForm";

interface Props {
  productSlug: string;
  aggregate: ReviewAggregate;
  reviews: Review[];
  eligibility: "eligible" | "already_reviewed" | "not_eligible" | "unauthenticated";
}

const RATING_ROWS: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];

export function ReviewsSection({ productSlug, aggregate, reviews, eligibility }: Props) {
  const { avg, count, distribution } = aggregate;

  return (
    <section className="mt-16 border-t border-border/70 pt-12">
      <div className="grid gap-10 md:grid-cols-[minmax(220px,280px)_1fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Customer reviews</p>
          {count > 0 ? (
            <>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-4xl">{avg.toFixed(1)}</span>
                <span className="text-sm text-ink-muted">out of 5</span>
              </div>
              <RatingStars avg={avg} count={count} className="mt-2" />
              <ul className="mt-6 space-y-1.5 text-xs">
                {RATING_ROWS.map((r) => {
                  const pct = count === 0 ? 0 : Math.round((distribution[r] / count) * 100);
                  return (
                    <li key={r} className="flex items-center gap-2">
                      <span className="w-8 text-ink-muted">{r}★</span>
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
                        <span className="absolute inset-y-0 left-0 rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 text-right text-ink-muted">{distribution[r]}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">No reviews yet. Be the first once your order arrives.</p>
          )}
        </div>

        <div>
          {eligibility === "eligible" && (
            <div className="mb-8">
              <ReviewForm productSlug={productSlug} />
            </div>
          )}
          {eligibility === "unauthenticated" && (
            <div className="mb-8 rounded-card border border-border bg-cream-warm p-5 text-sm">
              <Link href={`/login?next=/products/${productSlug}`} className="link-underline font-medium">Sign in</Link>{" "}
              — bought this saree? You can post a verified review after signing in.
            </div>
          )}
          {eligibility === "already_reviewed" && (
            <p className="mb-6 rounded-card border border-border bg-cream-warm p-4 text-sm text-ink-muted">
              Thanks — your review is live below.
            </p>
          )}
          {eligibility === "not_eligible" && (
            <p className="mb-6 rounded-card border border-border bg-cream-warm p-4 text-sm text-ink-muted">
              Only buyers can post reviews. Once you receive an order for this saree, you can share your take here.
            </p>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-ink-muted">No published reviews yet.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {reviews.map((r) => (
                <li key={r.id} className="py-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <p className="font-display text-base">{r.title}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-wider text-ink-muted">
                        {r.authorName} · Verified buyer
                      </p>
                    </div>
                    <RatingStars avg={r.rating} showCount={false} size="sm" />
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-ink-soft">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
