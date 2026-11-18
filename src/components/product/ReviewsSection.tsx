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
    <section className="mt-16 border-t border-purple-100 pt-12">
      <div className="grid gap-10 md:grid-cols-[minmax(220px,280px)_1fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
            Weaver Feedback
          </span>
          {count > 0 ? (
            <>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-heritage text-4xl font-bold text-brand-plum">{avg.toFixed(1)}</span>
                <span className="text-sm text-purple-900/60 font-medium">out of 5 stars</span>
              </div>
              <RatingStars avg={avg} count={count} className="mt-2" />
              <ul className="mt-6 space-y-2 text-xs">
                {RATING_ROWS.map((r) => {
                  const pct = count === 0 ? 0 : Math.round((distribution[r] / count) * 100);
                  return (
                    <li key={r} className="flex items-center gap-2">
                      <span className="w-8 text-purple-900/70 font-semibold">{r}★</span>
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-purple-100">
                        <span className="absolute inset-y-0 left-0 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 text-right text-purple-900/60 font-medium">{distribution[r]}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-xs text-purple-900/70">No reviews yet. Be the first to share your drape experience once your order arrives.</p>
          )}
        </div>

        <div>
          {eligibility === "eligible" && (
            <div className="mb-8">
              <ReviewForm productSlug={productSlug} />
            </div>
          )}
          {eligibility === "unauthenticated" && (
            <div className="mb-8 rounded-xl border border-purple-200 bg-purple-50/70 p-4 text-xs sm:text-sm text-purple-950">
              <Link href={`/login?next=/products/${productSlug}`} className="text-brand-purple font-semibold hover:underline">Sign in</Link>{" "}
              — already draped this saree? You can post a verified weaver review after signing in.
            </div>
          )}
          {eligibility === "already_reviewed" && (
            <p className="mb-6 rounded-xl border border-purple-200 bg-purple-50/70 p-4 text-xs sm:text-sm text-purple-950">
              Thank you! Your verified review is published below.
            </p>
          )}
          {eligibility === "not_eligible" && (
            <p className="mb-6 rounded-xl border border-purple-100 bg-purple-50/40 p-4 text-xs sm:text-sm text-purple-900/70">
              Only verified buyers who received this saree can leave reviews.
            </p>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-purple-900/60">No published reviews yet.</p>
          ) : (
            <ul className="divide-y divide-purple-100">
              {reviews.map((r) => (
                <li key={r.id} className="py-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <p className="font-heritage font-bold text-base text-brand-plum">{r.title}</p>
                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-purple-900/60">
                        {r.authorName} · <span className="text-emerald-700">Verified Buyer</span>
                      </p>
                    </div>
                    <RatingStars avg={r.rating} showCount={false} size="sm" />
                  </div>
                  <p className="mt-2.5 whitespace-pre-line text-sm text-slate-700 leading-relaxed">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
