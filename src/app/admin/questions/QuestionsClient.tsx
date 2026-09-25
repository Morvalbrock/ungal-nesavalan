"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ProductQuestion } from "@/types/question";

interface Row {
  question: ProductQuestion;
  productName: string;
  productSlug: string;
}

type FilterKey = "all" | "pending" | "answered";

export function QuestionsClient({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterKey>("pending");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const filtered = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return !r.question.answer;
    return !!r.question.answer;
  });

  async function post(id: string, payload: object) {
    setBanner(null);
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setBanner(data.error ?? "Something went wrong.");
      return false;
    }
    return true;
  }

  const answer = (id: string) => {
    const body = (answers[id] ?? "").trim();
    if (body.length < 2) {
      setBanner("Write at least 2 characters.");
      return;
    }
    startTransition(async () => {
      const ok = await post(id, { action: "answer", body });
      if (ok) {
        setAnswers((s) => ({ ...s, [id]: "" }));
        router.refresh();
      }
    });
  };

  const togglePublish = (id: string, published: boolean) => {
    startTransition(async () => {
      const ok = await post(id, { action: "publish", published });
      if (ok) router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!confirm("Delete this question?")) return;
    startTransition(async () => {
      const ok = await post(id, { action: "delete" });
      if (ok) router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Support</p>
          <h1 className="mt-2 font-display text-3xl">Product Q &amp; A</h1>
        </div>
        <div className="flex gap-1 text-xs">
          {(["pending", "answered", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "rounded-full border border-ink bg-ink px-3 py-1 text-cream"
                  : "rounded-full border border-border px-3 py-1 text-ink-soft hover:border-ink hover:text-ink"
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {banner && (
        <div className="rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">{banner}</div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-card border border-border bg-cream p-10 text-center text-ink-muted">
          Nothing here.
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map(({ question: q, productName, productSlug }) => (
            <li key={q.id} className="rounded-card border border-border bg-cream p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    {q.authorName} · {new Date(q.createdAt).toLocaleString("en-IN")}
                  </p>
                  {productSlug ? (
                    <Link href={`/products/${productSlug}`} className="mt-1 block font-display text-base link-underline">
                      {productName}
                    </Link>
                  ) : (
                    <p className="mt-1 font-display text-base text-ink-muted">{productName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
                  {q.answer ? (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-700">Answered</span>
                  ) : (
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-700">Pending</span>
                  )}
                  {q.published ? (
                    <span className="rounded-full bg-ink/10 px-2 py-1 text-ink">Published</span>
                  ) : (
                    <span className="rounded-full bg-ink/5 px-2 py-1 text-ink-muted">Hidden</span>
                  )}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm text-ink">{q.body}</p>

              {q.answer ? (
                <div className="mt-3 rounded-card bg-cream-warm p-3 text-sm text-ink-soft">
                  <p className="text-[10px] uppercase tracking-wider text-ink-muted">
                    {q.answer.authorName} · {new Date(q.answer.answeredAt).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 whitespace-pre-line">{q.answer.body}</p>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Type your answer…"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
                    className="w-full rounded-card border border-border bg-cream-warm px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <div className="flex justify-end">
                    <button onClick={() => answer(q.id)} disabled={pending} className="btn-primary text-xs">
                      {pending ? "Saving…" : "Answer & publish"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => togglePublish(q.id, !q.published)}
                  disabled={pending}
                  className="rounded-full border border-border px-3 py-1 text-ink-soft hover:border-ink hover:text-ink"
                >
                  {q.published ? "Hide" : "Publish"}
                </button>
                <button
                  onClick={() => remove(q.id)}
                  disabled={pending}
                  className="rounded-full border border-maroon/40 px-3 py-1 text-maroon hover:bg-maroon/5"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
