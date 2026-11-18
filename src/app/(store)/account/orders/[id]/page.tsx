import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getSession } from "@/features/auth/session";
import { orderRepo, returnRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { formatIST } from "@/lib/datetime";
import { RequestReturnButton } from "@/components/account/RequestReturnButton";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

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
    <section className="space-y-6">
      <div>
        <Link href="/account/orders" className="text-xs font-semibold text-brand-purple hover:underline">
          ← Back to All Orders
        </Link>
        <div className="mt-2 flex items-baseline justify-between">
          <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-brand-plum">Order #{order.orderNumber}</h2>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple border border-purple-200 uppercase">
            {order.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-1 text-xs text-purple-900/60">
          Placed on {formatIST(order.createdAt)}
        </p>
      </div>

      {/* Visual Timeline of Order Progress */}
      <OrderTimeline order={order} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] items-start">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-plum mb-3">Sarees in this Order</h3>
          <ul className="divide-y divide-purple-100 rounded-2xl border border-purple-100 bg-white shadow-xs overflow-hidden">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-4 p-4 items-center">
                {i.imageSnapshot && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.imageSnapshot} alt={i.productNameSnapshot} className="h-20 w-16 rounded-xl border border-purple-100 object-cover" />
                )}
                <div className="flex flex-1 items-start justify-between text-sm">
                  <div>
                    <p className="font-heritage font-bold text-base text-brand-plum">{i.productNameSnapshot}</p>
                    <p className="text-xs text-purple-900/60 mt-0.5">
                      {i.variantLabelSnapshot ? `${i.variantLabelSnapshot} · ` : ""}Qty: {i.quantity}
                    </p>
                  </div>
                  <p className="font-heritage font-bold text-base text-brand-plum">{formatINR(i.unitPricePaise * i.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 text-sm rounded-2xl border border-purple-100 bg-purple-50/30 p-5 shadow-xs">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-plum">Delivery Destination</h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-700">
              <strong className="text-brand-plum">{order.addressSnapshot.fullName}</strong>
              <br />
              {order.addressSnapshot.line1}
              {order.addressSnapshot.line2 ? `, ${order.addressSnapshot.line2}` : ""}
              <br />
              {order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.pincode}
              <br />
              {order.addressSnapshot.country} · {order.addressSnapshot.phone}
            </p>
          </div>

          {(order.trackingId || order.courier) && (
            <div className="border-t border-purple-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-plum">Courier Tracking</h3>
              <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                {order.trackingId && <span className="font-bold text-brand-plum">{order.trackingId}</span>}
                {order.trackingId && order.courier && <span className="text-purple-400"> · </span>}
                {order.courier && <span className="font-medium">{order.courier}</span>}
              </p>
            </div>
          )}
          <div className="border-t border-purple-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-plum">Payment Summary</h3>
            <dl className="mt-2 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between"><dt className="text-purple-900/70">Subtotal</dt><dd className="font-semibold">{formatINR(order.subtotalPaise)}</dd></div>
              {order.discountPaise > 0 && order.couponSnapshot && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <dt>Coupon ({order.couponSnapshot.code})</dt>
                  <dd>−{formatINR(order.discountPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between"><dt className="text-purple-900/70">Shipping</dt><dd>{order.shippingPaise === 0 ? <span className="text-emerald-700 font-bold">Free</span> : formatINR(order.shippingPaise)}</dd></div>
              <div className="flex justify-between border-t border-purple-100 pt-2 font-bold text-brand-plum font-heritage text-base"><dt>Total Amount</dt><dd>{formatINR(order.totalPaise)}</dd></div>
              {order.paymentMode === "cod" && (order.amountDuePaise ?? 0) > 0 && (
                <>
                  <div className="flex justify-between pt-2 text-emerald-700 font-medium">
                    <dt>Deposit Paid</dt>
                    <dd>{formatINR(order.amountPaidPaise ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between text-amber-800 font-bold">
                    <dt>Cash Due on Delivery</dt>
                    <dd>{formatINR(order.amountDuePaise ?? 0)}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {["paid", "packed", "shipped", "delivered", "return_requested", "refunded"].includes(order.status) && (
            <div className="pt-2">
              <a
                href={`/api/orders/${order.id}/invoice`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-brand-plum hover:bg-purple-100 transition shadow-xs"
              >
                <Download className="h-3.5 w-3.5" /> Download Tax Invoice (PDF)
              </a>
            </div>
          )}

          {returnRequest && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs text-purple-950">
              <p className="font-bold text-brand-plum">Return Request: {returnRequest.decision ?? "Under Review"}</p>
              <p className="mt-1">Reason: {returnRequest.reason.replace("_", " ")}</p>
              {returnRequest.adminNote && <p className="mt-1">Note: {returnRequest.adminNote}</p>}
              {returnRequest.refundId && <p className="mt-1">Refund ID: {returnRequest.refundId}</p>}
            </div>
          )}

          {showReturnButton && <RequestReturnButton orderId={order.id} />}
        </div>
      </div>
    </section>
  );
}
