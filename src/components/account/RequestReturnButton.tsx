"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RETURN_REASONS, type ReturnReason } from "@/types/return-request";

const LABELS: Record<ReturnReason, string> = {
  damaged: "Arrived damaged",
  wrong_item: "Wrong item received",
  not_as_described: "Not as described",
  size_fit: "Size / fit issue",
  changed_mind: "Changed my mind",
  other: "Other"
};

export function RequestReturnButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReturnReason>("damaged");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note: note.trim() })
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(message(data.error));
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-card border border-border px-3 py-2 text-xs text-ink-soft hover:border-ink hover:text-ink"
      >
        Request return
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-card border border-border bg-cream-warm p-4 text-sm">
      <p className="font-medium">Request a return</p>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Reason</span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as ReturnReason)}
          className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        >
          {RETURN_REASONS.map((r) => (
            <option key={r} value={r}>{LABELS[r]}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Note (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      {error && <p className="text-xs text-maroon">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary flex-1">
          {pending ? "Submitting…" : "Submit request"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

function message(code: string | undefined): string {
  switch (code) {
    case "not_delivered": return "Only delivered orders can be returned.";
    case "window_closed": return "The return window for this order has closed.";
    case "already_requested": return "A return request already exists for this order.";
    default: return "Could not submit the return request.";
  }
}
