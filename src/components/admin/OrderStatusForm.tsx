"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { OrderStatus } from "@/types/order";
import { markCodCollected, updateOrderStatus } from "@/features/admin/actions";
import { formatINR } from "@/lib/utils";

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
  courier: initialCourier,
  preferredCourier,
  paymentMode,
  amountPaidPaise,
  amountDuePaise,
  totalPaise
}: {
  orderId: string;
  current: OrderStatus;
  trackingId?: string;
  courier?: string;
  preferredCourier?: string;
  paymentMode?: "prepaid" | "cod";
  amountPaidPaise?: number;
  amountDuePaise?: number;
  totalPaise?: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(current);
  const [trackingId, setTrackingId] = useState(initialTrackingId ?? "");
  const [courier, setCourier] = useState(initialCourier ?? preferredCourier ?? "");
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
      {preferredCourier && (
        <p className="mt-2 text-xs text-ink-soft">
          Customer preferred: <span className="font-medium text-ink">{preferredCourier}</span>
        </p>
      )}
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

      {paymentMode === "cod" && (
        <div className="mt-5 rounded-card border border-border/70 bg-cream-warm/50 p-3 text-xs">
          <p className="text-ink-muted">
            Cash on Delivery · deposit <span className="text-ink">{formatINR(amountPaidPaise ?? 0)}</span> paid
            {typeof totalPaise === "number" ? ` of ${formatINR(totalPaise)}` : ""}
          </p>
          {(amountDuePaise ?? 0) > 0 ? (
            <CodCollectButton
              orderId={orderId}
              amountDuePaise={amountDuePaise ?? 0}
              onDone={() => router.refresh()}
            />
          ) : (
            <p className="mt-1 text-emerald-700">Fully collected</p>
          )}
        </div>
      )}
    </div>
  );
}

function CodCollectButton({
  orderId,
  amountDuePaise,
  onDone
}: {
  orderId: string;
  amountDuePaise: number;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const click = () => {
    setError(null);
    startTransition(async () => {
      const res = await markCodCollected(orderId);
      if (res.ok) onDone();
      else setError(res.error);
    });
  };
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={click}
        disabled={pending}
        className="rounded-card border border-ink bg-ink px-3 py-1.5 text-[11px] uppercase tracking-widest text-cream hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Marking…" : `Mark ${formatINR(amountDuePaise)} cash collected`}
      </button>
      {error && <p className="mt-1 text-maroon">{error}</p>}
    </div>
  );
}
