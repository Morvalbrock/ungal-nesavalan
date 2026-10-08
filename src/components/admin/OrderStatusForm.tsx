"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { OrderStatus } from "@/types/order";
import { updateOrderStatus } from "@/features/admin/actions";

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "return_requested",
  "cancelled",
  "refunded"
];

export function OrderStatusForm({
  orderId,
  current,
  trackingId: initialTrackingId,
  courier: initialCourier
}: {
  orderId: string;
  current: OrderStatus;
  trackingId?: string;
  courier?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(current);
  const [trackingId, setTrackingId] = useState(initialTrackingId ?? "");
  const [courier, setCourier] = useState(initialCourier ?? "");
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    status !== current ||
    trackingId.trim() !== (initialTrackingId ?? "") ||
    courier.trim() !== (initialCourier ?? "");

  const save = () => {
    setNotice(null);
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status, {
        trackingId: trackingId.trim(),
        courier: courier.trim()
      });
      if (res.ok) {
        setNotice("Order updated");
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
      </div>

      <p className="mt-5 text-xs uppercase tracking-widest text-ink-muted">Shipment</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] text-ink-muted">Tracking ID</span>
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="e.g. AWB123456789"
            className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-ink-muted">Courier</span>
          <input
            type="text"
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            placeholder="e.g. Delhivery"
            className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
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
