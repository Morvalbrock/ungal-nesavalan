import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getSession } from "@/features/auth/session";
import { orderRepo, returnRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { RequestReturnButton } from "@/components/account/RequestReturnButton";

const RETURN_WINDOW_DAYS = Number(process.env.RETURN_WINDOW_DAYS ?? "7");

export const metadata: Metadata = { title: "Order detail" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) notFound();
  const { id } = await params;
  const order = await orderRepo.findById(id);
  if (!order || order.userId !== session.userId) notFound();

  const returnRequest = await returnRepo.findByOrder(order.id);
  const withinWindow =
    order.status === "delivered" &&
    Date.now() - new Date(order.updatedAt).getTime() < RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const showReturnButton = withinWindow && !returnRequest;

  return (
    <section>
      <Link href="/account/orders" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
        ← All orders
      </Link>
      <div className="mt-2 flex items-baseline justify-between">
        <h2 className="font-display text-2xl">Order {order.orderNumber}</h2>
        <span className="rounded-full bg-ink/10 px-3 py-1 text-[10px] uppercase tracking-widest">
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Placed {new Date(order.createdAt).toLocaleString("en-IN")}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-ink-muted">Items</h3>
          <ul className="mt-3 divide-y divide-border/70 rounded-card border border-border">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-4 p-4">
                {i.imageSnapshot && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.imageSnapshot} alt={i.productNameSnapshot} className="h-20 w-16 rounded object-cover" />
                )}
                <div className="flex flex-1 items-start justify-between text-sm">
                  <div>
                    <p className="font-medium">{i.productNameSnapshot}</p>
                    <p className="text-xs text-ink-muted">
                      {i.variantLabelSnapshot} · Qty {i.quantity}
                    </p>
                  </div>
                  <p>{formatINR(i.unitPricePaise * i.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 text-sm">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-ink-muted">Shipping to</h3>
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
          <div>
            <h3 className="text-xs uppercase tracking-widest text-ink-muted">Payment</h3>
            <dl className="mt-2 space-y-1">
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

          {["paid", "packed", "shipped", "delivered", "return_requested", "refunded"].includes(order.status) && (
            <a
              href={`/api/orders/${order.id}/invoice`}
              className="inline-flex items-center gap-2 rounded-card border border-border px-3 py-2 text-xs hover:border-ink"
            >
              <Download className="h-3.5 w-3.5" /> Download invoice
            </a>
          )}

          {returnRequest && (
            <div className="rounded-card border border-border bg-cream-warm p-4 text-xs text-ink-soft">
              <p className="font-medium text-ink">Return request {returnRequest.decision ?? "pending"}</p>
              <p className="mt-1">Reason: {returnRequest.reason.replace("_", " ")}</p>
              {returnRequest.adminNote && <p className="mt-1">Note: {returnRequest.adminNote}</p>}
              {returnRequest.refundId && <p className="mt-1">Refund: {returnRequest.refundId}</p>}
            </div>
          )}

          {showReturnButton && <RequestReturnButton orderId={order.id} />}
        </div>
      </div>
    </section>
  );
}
