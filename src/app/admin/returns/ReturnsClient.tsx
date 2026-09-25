"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReturnRequest } from "@/types/return-request";
import { decideReturn } from "@/features/admin/actions";
import { formatINR } from "@/lib/utils";

interface Row {
  request: ReturnRequest;
  orderNumber: string;
  totalPaise: number;
  customerName: string;
  customerEmail: string;
}

export function ReturnsClient({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  const submit = (id: string, decision: "approved" | "rejected") => {
    setBanner(null);
    startTransition(async () => {
      const res = await decideReturn(id, decision, note.trim());
      if (res.ok) {
        setNoteFor(null);
        setNote("");
        router.refresh();
      } else {
        setBanner(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Support</p>
        <h1 className="mt-2 font-display text-3xl">Return requests</h1>
      </div>

      {banner && (
        <div className="rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">{banner}</div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-card border border-border bg-cream-warm p-10 text-center text-ink-muted">
          No return requests yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map(({ request: r, orderNumber, totalPaise, customerName, customerEmail }) => (
            <li key={r.id} className="rounded-card border border-border bg-cream p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/orders/${r.orderId}`} className="font-display text-lg link-underline">
                      {orderNumber}
                    </Link>
                    <span
                      className={
                        r.decision === "approved"
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-[10px] uppercase tracking-widest text-green-800"
                          : r.decision === "rejected"
                          ? "rounded-full bg-border/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-ink-muted"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-widest text-amber-800"
                      }
                    >
                      {r.decision ?? "pending"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {customerName} · {customerEmail} · {formatINR(totalPaise)} · Reason:{" "}
                    <span className="text-ink">{r.reason.replace("_", " ")}</span>
                  </p>
                  {r.note && <p className="mt-3 text-sm text-ink-soft">"{r.note}"</p>}
                  {r.adminNote && (
                    <p className="mt-2 text-xs text-ink-muted">Admin note: {r.adminNote}</p>
                  )}
                  {r.refundId && (
                    <p className="mt-1 text-xs text-ink-muted">Refund: {r.refundId}</p>
                  )}
                </div>
                {!r.decision && (
                  <div className="w-full max-w-sm">
                    {noteFor === r.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={2}
                          placeholder="Admin note (optional)"
                          className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => submit(r.id, "approved")}
                            className="btn-primary flex-1"
                          >
                            Approve & refund
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => submit(r.id, "rejected")}
                            className="btn-ghost flex-1"
                          >
                            Reject
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNoteFor(null);
                            setNote("");
                          }}
                          className="text-xs text-ink-muted hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNoteFor(r.id)}
                        className="btn-ghost w-full"
                      >
                        Review request
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
