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
    <div className="rounded-card border border-border bg-cream p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-ink-muted">Fulfillment Journey</p>
          <h2 className="font-display text-lg text-ink">Order Lifecycle & Tracking</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
            isCancelled
              ? "bg-maroon/10 text-maroon"
              : isRefunded
                ? "bg-purple-100 text-purple-800"
                : order.status === "delivered"
                  ? "bg-emerald-100 text-emerald-800"
                  : order.status === "pending"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-ink text-white"
          }`}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>

      {isCancelled ? (
        <div className="mt-5 flex items-start gap-3 rounded-card border border-maroon/20 bg-maroon/5 p-4 text-maroon">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Order Cancelled</p>
            <p className="mt-0.5 text-xs text-maroon/80">
              This order has been cancelled. If any payment was captured, refund processing will be initiated according to policy.
            </p>
          </div>
        </div>
      ) : isRefunded ? (
        <div className="mt-5 flex items-start gap-3 rounded-card border border-purple-200 bg-purple-50 p-4 text-purple-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Order Refunded</p>
            <p className="mt-0.5 text-xs text-purple-800">
              This order was refunded to the customer.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <ol className="relative border-l border-border/80 ml-3 sm:ml-4 space-y-6">
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
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                        : isCurrent
                          ? "bg-ink text-white ring-4 ring-ink/10 animate-pulse"
                          : "border border-border bg-cream text-ink-muted/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>

                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <h3
                      className={`text-sm font-medium ${
                        isDone ? "text-ink" : isCurrent ? "text-ink font-semibold" : "text-ink-muted"
                      }`}
                    >
                      {step.label}
                    </h3>
                    {step.date && (
                      <span className="text-[11px] text-ink-muted">{step.date}</span>
                    )}
                  </div>

                  {step.description && (
                    <p
                      className={`mt-0.5 text-xs ${
                        isCurrent
                          ? "text-ink font-medium"
                          : isDone
                            ? "text-ink-soft"
                            : "text-ink-muted/70"
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
