import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { getSession } from "@/features/auth/session";
import { orderRepo, userRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { SuccessExtras } from "@/components/checkout/SuccessExtras";
import { getOrCreateReferralCoupon } from "@/features/referrals/generate";

export const metadata: Metadata = { title: "Order confirmed" };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  params
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { orderId } = await params;
  const order = await orderRepo.findById(orderId);
  if (!order || order.userId !== session.userId) notFound();

  const user = await userRepo.findById(session.userId);
  const referral = user
    ? await getOrCreateReferralCoupon({ user, order })
    : null;

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Check className="h-6 w-6" />
        </div>
        <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-ink-muted">Order {order.orderNumber}</p>
        <h1 className="mt-3 font-display text-4xl">Thank you for your order</h1>
        <p className="mt-3 text-ink-muted">
          A confirmation has been queued to <span className="text-ink">{session.email}</span>. We'll write again with
          tracking once your saree ships.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-card border border-border">
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
                  <p className="text-xs text-ink-muted">
                    {i.variantLabelSnapshot} · Qty {i.quantity}
                  </p>
                </div>
                <p>{formatINR(i.unitPricePaise * i.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-border/70 p-4 text-sm">
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd>{formatINR(order.subtotalPaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd>{order.shippingPaise === 0 ? "Free" : formatINR(order.shippingPaise)}</dd>
            </div>
            <div className="flex justify-between border-t border-border/70 pt-2 font-medium">
              <dt>Total</dt>
              <dd>{formatINR(order.totalPaise)}</dd>
            </div>
            {order.paymentMode === "cod" && (order.amountDuePaise ?? 0) > 0 && (
              <>
                <div className="flex justify-between pt-2 text-emerald-700">
                  <dt>Deposit paid</dt>
                  <dd>{formatINR(order.amountPaidPaise ?? 0)}</dd>
                </div>
                <div className="flex justify-between text-maroon">
                  <dt>Due on delivery (cash)</dt>
                  <dd>{formatINR(order.amountDuePaise ?? 0)}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      <SuccessExtras
        orderId={order.id}
        revenuePaise={order.totalPaise}
        couponCode={order.couponSnapshot?.code}
        referralCode={referral?.code}
        referralValueLabel={referral?.valueLabel}
      />

      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-3">
        <Link href={`/account/orders/${order.id}`} className="btn-primary">View order</Link>
        <Link href="/products" className="btn-ghost">Continue shopping</Link>
      </div>
    </Container>
  );
}
