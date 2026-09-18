"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { OrderStatus } from "@/types/order";
import { updateOrderStatus } from "@/features/admin/actions";

const STATUSES: OrderStatus[] = ["pending", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"];

export function OrderStatusForm({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(current);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setNotice(null);
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status);
      if (res.ok) {
        setNotice(`Status updated to "${status}"`);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="rounded-card border border-border bg-cream p-4">
      <p className="text-xs uppercase tracking-widest text-ink-muted">Status</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="rounded-card border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={save}
          disabled={pending || status === current}
          className="btn-primary"
        >
          {pending ? "Updating…" : "Update"}
        </button>
      </div>
      {notice && <p className="mt-2 text-xs text-ink-soft">{notice}</p>}
      {error && <p className="mt-2 text-xs text-maroon">{error}</p>}
    </div>
  );
}
