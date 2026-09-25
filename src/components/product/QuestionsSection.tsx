import type { ProductQuestion } from "@/types/question";
import { QuestionForm } from "./QuestionForm";

interface Props {
  productSlug: string;
  questions: ProductQuestion[];
  signedIn: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function QuestionsSection({ productSlug, questions, signedIn }: Props) {
  return (
    <section className="mt-16 border-t border-border/70 pt-12">
      <div className="grid gap-10 md:grid-cols-[minmax(220px,280px)_1fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Questions & answers</p>
          <p className="mt-3 text-sm text-ink-muted">
            Weave, colour, fit, occasion — anything you'd like clarified before you buy.
          </p>
          <p className="mt-6 text-xs text-ink-muted">{questions.length} published</p>
        </div>

        <div>
          <div className="mb-8">
            <QuestionForm productSlug={productSlug} signedIn={signedIn} />
          </div>

          {questions.length === 0 ? (
            <p className="text-sm text-ink-muted">No questions yet — ask the first one.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {questions.map((q) => (
                <li key={q.id} className="py-5">
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    {q.authorName} · {formatDate(q.createdAt)}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-ink">{q.body}</p>
                  {q.answer && (
                    <div className="mt-3 rounded-card bg-cream-warm p-4 text-sm text-ink-soft">
                      <p className="text-[10px] uppercase tracking-wider text-ink-muted">
                        {q.answer.authorName} · {formatDate(q.answer.answeredAt)}
                      </p>
                      <p className="mt-2 whitespace-pre-line">{q.answer.body}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
