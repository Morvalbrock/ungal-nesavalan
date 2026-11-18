import type { Order, OrderStatus } from "@/types/order";
import { Check, Clock, Package, Truck, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { formatIST } from "@/lib/datetime";

interface TimelineStep {
  key: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "completed" | "current" | "upcoming" | "error";
  date?: string;
}

export function OrderTimeline({ order }: { order: Order }) {
  const isCancelled = order.status === "cancelled";
  const isRefunded = order.status === "refunded";

  const orderDate = formatIST(order.createdAt);
  const updatedDate = formatIST(order.updatedAt);

  // Flow order for standard progression
  const stageWeights: Record<OrderStatus, number> = {
    pending: 1,
    paid: 2,
    packed: 3,
    shipped: 4,
    delivered: 5,
    return_requested: 5,
    refunded: 6,
    cancelled: 0
  };

  const currentWeight = stageWeights[order.status] ?? 1;

  const steps: TimelineStep[] = [
    {
      key: "placed",
      label: "Order Placed",
      description: `Order #${order.orderNumber}`,
      icon: Check,
      status: "completed",
      date: orderDate
    },
    {
      key: "payment",
      label: order.paymentMode === "cod" ? "COD Order Confirmed" : "Payment Confirmed",
      description:
        order.status === "pending"
          ? "Awaiting payment confirmation"
          : order.paymentMode === "cod"
            ? "Deposit paid · Balance due on delivery"
            : order.paymentId
              ? "Payment verified"
              : "Prepaid order confirmed",
      icon: order.status === "pending" ? Clock : Check,
      status:
        order.status === "pending"
          ? "current"
          : currentWeight >= 2
            ? "completed"
            : "upcoming",
      date: currentWeight >= 2 ? (order.status === "paid" ? updatedDate : undefined) : undefined
    },
    {
      key: "packed",
      label: "Packed & Quality Checked",
      description: currentWeight >= 3 ? "Carefully inspected & boxed" : "Atelier artisans preparing weave",
      icon: Package,
      status:
        order.status === "packed"
          ? "current"
          : currentWeight > 3
            ? "completed"
            : "upcoming",
      date: order.status === "packed" ? updatedDate : undefined
    },
    {
      key: "shipped",
      label: "Dispatched & In Transit",
      description:
        order.trackingId || order.courier
          ? `${order.courier ?? "Courier"} · Tracking: ${order.trackingId ?? "Assigned"}`
          : currentWeight >= 4
            ? "Handed over to courier"
            : "Awaiting dispatch",
      icon: Truck,
      status:
        order.status === "shipped"
          ? "current"
          : currentWeight > 4
            ? "completed"
            : "upcoming",
      date: order.status === "shipped" ? updatedDate : undefined
    },
    {
      key: "delivered",
      label: "Delivered",
      description: currentWeight >= 5 ? "Handed over to recipient" : "Estimated delivery upon dispatch",
      icon: CheckCircle2,
      status: order.status === "delivered" ? "completed" : "upcoming",
      date: order.status === "delivered" ? updatedDate : undefined
    }
  ];

  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-purple-100 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-900/60">Fulfillment Journey</p>
          <h2 className="font-heritage text-lg font-bold text-brand-plum">Order Lifecycle &amp; Tracking</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border ${
            isCancelled
              ? "bg-rose-100 text-rose-900 border-rose-200"
              : isRefunded
                ? "bg-purple-100 text-purple-900 border-purple-200"
                : order.status === "delivered"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-200"
                  : order.status === "pending"
                    ? "bg-amber-100 text-amber-900 border-amber-200"
                    : "bg-brand-deep text-white border-brand-deep"
          }`}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>

      {isCancelled ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Order Cancelled</p>
            <p className="mt-0.5 text-xs text-rose-700">
              This order has been cancelled. If any payment was captured, refund processing will be initiated according to policy.
            </p>
          </div>
        </div>
      ) : isRefunded ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4 text-purple-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Order Refunded</p>
            <p className="mt-0.5 text-xs text-purple-800">
              This order was refunded to the customer.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <ol className="relative border-l border-purple-200 ml-3 sm:ml-4 space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              const isDone = step.status === "completed";
              const isCurrent = step.status === "current";

              return (
                <li key={step.key} className="ml-6 relative">
                  {/* Step node icon */}
                  <span
                    className={`absolute -left-[37px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-xs transition ${
                      isDone
                        ? "bg-brand-purple text-white ring-4 ring-purple-100"
                        : isCurrent
                          ? "bg-brand-deep text-white ring-4 ring-purple-200 animate-pulse"
                          : "border border-purple-200 bg-white text-purple-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>

                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <h3
                      className={`text-sm font-semibold ${
                        isDone ? "text-brand-plum" : isCurrent ? "text-brand-purple font-bold" : "text-purple-900/50"
                      }`}
                    >
                      {step.label}
                    </h3>
                    {step.date && (
                      <span className="text-[11px] text-purple-900/60">{step.date}</span>
                    )}
                  </div>

                  {step.description && (
                    <p
                      className={`mt-0.5 text-xs ${
                        isCurrent
                          ? "text-slate-800 font-medium"
                          : isDone
                            ? "text-slate-600"
                            : "text-purple-900/40"
                      }`}
                    >
                      {step.description}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
