"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { VALID_ORDER_TRANSITIONS, type OrderStatus } from "@/types/order";
import { markCodCollected, updateOrderStatus } from "@/features/admin/actions";
import { formatINR } from "@/lib/utils";
import { AlertCircle, CheckCircle, Package, Truck, XCircle } from "lucide-react";

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

  // Valid next statuses from current status
  const allowedNext = VALID_ORDER_TRANSITIONS[current] ?? [];
  const selectableStatuses: OrderStatus[] = [current, ...allowedNext];

  const dirty =
    status !== current ||
    trackingId.trim() !== (initialTrackingId ?? "") ||
    courier.trim() !== (initialCourier ?? "");

  const saveStatus = (targetStatus: OrderStatus) => {
    setNotice(null);
    setError(null);

    if (targetStatus === "shipped" && !trackingId.trim() && !courier.trim()) {
      setError("Please provide at least Courier name or Tracking ID before marking order as Shipped.");
      return;
    }

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, targetStatus, {
        trackingId: trackingId.trim(),
        courier: courier.trim()
      });
      if (res.ok) {
        setStatus(targetStatus);
        setNotice(`Order status updated to "${targetStatus}".`);
        router.refresh();
      } else {
        setError(res.error ?? "Failed to update order");
      }
    });
  };

  const getQuickAction = () => {
    switch (current) {
      case "paid":
        return {
          label: "Mark as Packed",
          target: "packed" as OrderStatus,
          icon: Package,
          cls: "btn-primary"
        };
      case "packed":
        return {
          label: "Mark as Shipped",
          target: "shipped" as OrderStatus,
          icon: Truck,
          cls: "btn-primary"
        };
      case "shipped":
        return {
          label: "Mark as Delivered",
          target: "delivered" as OrderStatus,
          icon: CheckCircle,
          cls: "bg-emerald-700 text-white hover:bg-emerald-800"
        };
      default:
        return null;
    }
  };

  const quickAction = getQuickAction();

  return (
    <div className="rounded-card border border-border bg-cream p-4 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-muted">Status Management</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-ink-soft">Current Status:</span>
          <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-ink">
            {current.replace("_", " ")}
          </span>
        </div>
      </div>

      {current === "pending" && (
        <div className="flex items-start gap-2.5 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>
            <strong>Payment Pending:</strong> This order cannot be manually advanced to Packed or Shipped. Status will automatically update to <strong>Paid</strong> when customer payment succeeds.
          </p>
        </div>
      )}

      {/* Quick Action Button for Next Logical Step */}
      {quickAction && (
        <div className="rounded border border-border/80 bg-cream-warm/40 p-3">
          <p className="text-[11px] uppercase tracking-wider text-ink-muted mb-2">Next Lifecycle Step:</p>
          <button
            type="button"
            onClick={() => saveStatus(quickAction.target)}
            disabled={pending}
            className={`inline-flex items-center gap-2 rounded px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition ${quickAction.cls}`}
          >
            <quickAction.icon className="h-4 w-4" />
            {pending ? "Updating…" : quickAction.label}
          </button>
        </div>
      )}

      {/* Manual Status Dropdown — Strictly limited to valid step-by-step next states */}
      <div>
        <label className="block">
          <span className="mb-1 block text-[11px] text-ink-muted uppercase tracking-wider">
            Allowed Transitions
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            disabled={pending || selectableStatuses.length <= 1}
            className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
          >
            {selectableStatuses.map((s) => (
              <option key={s} value={s}>
                {s === current ? `${s} (current)` : `→ ${s}`}
              </option>
            ))}
          </select>
        </label>
        {selectableStatuses.length <= 1 && (
          <p className="mt-1 text-[11px] text-ink-muted">
            Terminal state or awaiting payment. No further manual advancement permitted.
          </p>
        )}
      </div>

      {/* Shipment Details */}
      <div className="border-t border-border/70 pt-3">
        <p className="text-xs uppercase tracking-widest text-ink-muted">Shipment Info</p>
        {preferredCourier && (
          <p className="mt-1 text-xs text-ink-soft">
            Customer preferred courier: <span className="font-semibold text-ink">{preferredCourier}</span>
          </p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] text-ink-muted">Tracking ID / AWB</span>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. ST12345678"
              className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] text-ink-muted">Courier Partner</span>
            <input
              type="text"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              placeholder="e.g. ST Courier / Professional"
              className="w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </label>
        </div>
      </div>

      {dirty && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => saveStatus(status)}
            disabled={pending}
            className="btn-primary w-full text-xs"
          >
            {pending ? "Saving Changes…" : `Save (${status !== current ? `Change to ${status}` : "Update Tracking"})`}
          </button>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded bg-maroon/10 border border-maroon/20 p-2.5 text-xs text-maroon">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {paymentMode === "cod" && (
        <div className="rounded-card border border-amber-200 bg-amber-50/60 p-3 text-xs">
          <p className="font-semibold text-amber-900">💵 Cash on Delivery (COD)</p>
          <p className="mt-1 text-ink-soft">
            Deposit paid: <span className="font-medium text-ink">{formatINR(amountPaidPaise ?? 0)}</span>
            {typeof totalPaise === "number" ? ` of ${formatINR(totalPaise)}` : ""}
          </p>
          {(amountDuePaise ?? 0) > 0 ? (
            <div className="mt-2">
              <span className="font-medium text-maroon">
                Balance due on delivery: {formatINR(amountDuePaise ?? 0)}
              </span>
              <CodCollectButton
                orderId={orderId}
                amountDuePaise={amountDuePaise ?? 0}
                onDone={() => router.refresh()}
              />
            </div>
          ) : (
            <p className="mt-1 font-medium text-emerald-700">✓ Balance fully collected</p>
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
