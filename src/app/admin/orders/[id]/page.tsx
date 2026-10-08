import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { orderRepo, paymentRepo, userRepo } from "@/server/repositories";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await orderRepo.findById(id);
  if (!order) notFound();

  const [user, payment] = await Promise.all([
    userRepo.findById(order.userId),
    order.paymentId ? paymentRepo.findById(order.paymentId) : Promise.resolve(null)
  ]);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
          ← Orders
        </Link>
        <h1 className="mt-2 font-display text-3xl">{order.orderNumber}</h1>
        <p className="text-sm text-ink-muted">
          Placed {new Date(order.createdAt).toLocaleString("en-IN")}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-cream">
            <div className="border-b border-border/70 p-4">
              <p className="text-[11px] uppercase tracking-widest text-ink-muted">Line items</p>
            </div>
            <ul className="divide-y divide-border/70">
              {order.items.map((i) => (
                <li key={i.id} className="flex gap-4 p-4">
                  {i.imageSnapshot && (
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-cream-warm">
                      <Image src={i.imageSnapshot} alt={i.productNameSnapshot} fill sizes="80px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex flex-1 items-start justify-between text-sm">
                    <div>
                      <p className="font-medium">{i.productNameSnapshot}</p>
                      <p className="text-xs text-ink-muted">{i.variantLabelSnapshot} · Qty {i.quantity}</p>
                    </div>
                    <p>{formatINR(i.unitPricePaise * i.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border/70 p-4 text-sm">
              <dl className="ml-auto max-w-xs space-y-1">
                <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd>{formatINR(order.subtotalPaise)}</dd></div>
                {order.discountPaise > 0 && order.couponSnapshot && (
                  <div className="flex justify-between text-maroon">
                    <dt>Coupon {order.couponSnapshot.code}</dt>
                    <dd>−{formatINR(order.discountPaise)}</dd>
                  </div>
                )}
                <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd>{order.shippingPaise === 0 ? "Free" : formatINR(order.shippingPaise)}</dd></div>
                <div className="flex justify-between border-t border-border/70 pt-2 font-medium"><dt>Total</dt><dd>{formatINR(order.totalPaise)}</dd></div>
              </dl>
            </div>
          </div>

          {["paid", "packed", "shipped", "delivered", "return_requested", "refunded"].includes(order.status) && (
            <a
              href={`/api/orders/${order.id}/invoice`}
              className="inline-flex items-center gap-2 self-start rounded-card border border-border px-3 py-2 text-xs hover:border-ink"
            >
              <Download className="h-3.5 w-3.5" /> Download invoice
            </a>
          )}
        </div>

        <div className="space-y-4 text-sm">
          <OrderStatusForm
            orderId={order.id}
            current={order.status}
            trackingId={order.trackingId}
            courier={order.courier}
          />

          <div className="rounded-card border border-border bg-cream p-4">
            <p className="text-[11px] uppercase tracking-widest text-ink-muted">Customer</p>
            <p className="mt-2 font-medium">{user?.name ?? "—"}</p>
            <p className="text-xs text-ink-muted">{user?.email ?? ""}</p>
            {user?.phone && <p className="text-xs text-ink-muted">{user.phone}</p>}
          </div>

          <div className="rounded-card border border-border bg-cream p-4">
            <p className="text-[11px] uppercase tracking-widest text-ink-muted">Shipping</p>
            <p className="mt-2 leading-relaxed">
              {order.addressSnapshot.fullName}
              <br />
              {order.addressSnapshot.line1}
              {order.addressSnapshot.line2 ? `, ${order.addressSnapshot.line2}` : ""}
              <br />
              {order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.pincode}
              <br />
              {order.addressSnapshot.country} · {order.addressSnapshot.phone}
            </p>
          </div>

          {payment && (
            <div className="rounded-card border border-border bg-cream p-4">
              <p className="text-[11px] uppercase tracking-widest text-ink-muted">Payment</p>
              <p className="mt-2">Provider: {payment.provider}</p>
              <p className="text-xs text-ink-muted">Status: {payment.status}</p>
              <p className="text-xs text-ink-muted">Ref: {payment.providerPaymentId ?? payment.providerOrderId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
