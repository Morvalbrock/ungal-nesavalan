import type { ProductQuestion } from "@/types/question";
import { QuestionForm } from "./QuestionForm";
import { formatIST } from "@/lib/datetime";

interface Props {
  productSlug: string;
  questions: ProductQuestion[];
  signedIn: boolean;
}

function formatDate(iso: string): string {
  return formatIST(iso, { year: "numeric", month: "short", day: "numeric" });
}

export function QuestionsSection({ productSlug, questions, signedIn }: Props) {
  return (
    <section className="mt-16 border-t border-purple-100 pt-12">
      <div className="grid gap-10 md:grid-cols-[minmax(220px,280px)_1fr]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
            Weaver Q&amp;A
          </span>
          <h2 className="mt-2 font-heritage text-2xl font-bold text-brand-plum">Questions &amp; Answers</h2>
          <p className="mt-2 text-xs sm:text-sm text-purple-900/70">
            Weave technique, border width, blouse piece length, or draping queries — our Elampillai team is happy to answer.
          </p>
          <p className="mt-4 text-xs font-semibold text-purple-900/60">{questions.length} questions answered</p>
        </div>

        <div>
          <div className="mb-8">
            <QuestionForm productSlug={productSlug} signedIn={signedIn} />
          </div>

          {questions.length === 0 ? (
            <p className="text-xs sm:text-sm text-purple-900/60">No questions posted yet. Ask anything about this drape.</p>
          ) : (
            <ul className="divide-y divide-purple-100">
              {questions.map((q) => (
                <li key={q.id} className="py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-900/60">
                    {q.authorName} · {formatDate(q.createdAt)}
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm font-semibold text-brand-plum">{q.body}</p>
                  {q.answer && (
                    <div className="mt-3 rounded-xl border border-purple-200/80 bg-purple-50/70 p-4 text-xs sm:text-sm text-purple-950">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-purple">
                        {q.answer.authorName} (Master Weaver) · {formatDate(q.answer.answeredAt)}
                      </p>
                      <p className="mt-1.5 whitespace-pre-line leading-relaxed">{q.answer.body}</p>
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
