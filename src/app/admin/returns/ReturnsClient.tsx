"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
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

type DecisionFilter = "all" | "pending" | "approved" | "rejected";

export function ReturnsClient({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DecisionFilter>("pending");

  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    return rows.filter((r) => {
      const currentDecision = r.request.decision ?? "pending";
      if (filter !== "all" && currentDecision !== filter) return false;
      if (n) {
        const hay = `${r.orderNumber} ${r.customerName} ${r.customerEmail} ${r.request.reason} ${r.request.note ?? ""}`.toLowerCase();
        if (!hay.includes(n)) return false;
      }
      return true;
    });
  }, [rows, search, filter]);

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
        <h1 className="mt-2 font-display text-3xl">
          Return requests
          <span className="ml-3 text-sm font-normal text-ink-muted">
            {filtered.length} of {rows.length}
          </span>
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-cream p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, customer, reason…"
            className="w-full rounded-card border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="uppercase tracking-widest">Decision</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as DecisionFilter)}
            className="rounded-card border border-border bg-white px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      {banner && (
        <div className="rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">{banner}</div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-card border border-border bg-cream-warm p-10 text-center text-ink-muted">
          {rows.length === 0 ? "No return requests yet." : "No requests match your filters."}
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map(({ request: r, orderNumber, totalPaise, customerName, customerEmail }) => (
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
