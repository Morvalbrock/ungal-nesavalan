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
    <div className="bg-[#faf7fd] min-h-[85vh] py-12">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-brand-purple shadow-sm">
            <Check className="h-8 w-8 stroke-[2.5]" />
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
            Order {order.orderNumber} Confirmed
          </span>
          <h1 className="mt-3 font-heritage text-3xl sm:text-4xl text-brand-plum">Thank You for Supporting Handloom Weavers</h1>
          <p className="mt-2 text-sm text-purple-900/70">
            A confirmation invoice has been queued to <strong className="text-brand-plum">{session.email}</strong>. Our Elampillai master artisans will prepare your drape with utmost care.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-purple-100 bg-white shadow-xs overflow-hidden">
          <div className="bg-purple-50/50 px-5 py-3 border-b border-purple-100">
            <h2 className="font-heritage text-lg font-bold text-brand-plum">Drapes in this Order</h2>
          </div>
          <ul className="divide-y divide-purple-100">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-4 p-4 items-center">
                {i.imageSnapshot && (
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-purple-200/70 bg-purple-50">
                    <Image src={i.imageSnapshot} alt={i.productNameSnapshot} fill sizes="80px" className="object-cover" />
                  </div>
                )}
                <div className="flex flex-1 items-start justify-between text-sm">
                  <div>
                    <p className="font-heritage font-bold text-base text-brand-plum">{i.productNameSnapshot}</p>
                    <p className="text-xs text-purple-900/60 mt-0.5">
                      {i.variantLabelSnapshot ? `${i.variantLabelSnapshot} · ` : ""}Quantity: {i.quantity}
                    </p>
                  </div>
                  <p className="font-heritage font-bold text-base text-brand-plum">{formatINR(i.unitPricePaise * i.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-purple-100 p-5 bg-purple-50/30 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-purple-900/70 font-medium">Subtotal</dt>
                <dd className="font-semibold text-slate-800">{formatINR(order.subtotalPaise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-purple-900/70 font-medium">Shipping</dt>
                <dd>{order.shippingPaise === 0 ? <span className="text-emerald-700 font-bold">Free</span> : formatINR(order.shippingPaise)}</dd>
              </div>
              <div className="flex justify-between border-t border-purple-100 pt-2 font-bold text-base text-brand-plum font-heritage">
                <dt>Total Amount</dt>
                <dd className="text-lg">{formatINR(order.totalPaise)}</dd>
              </div>
              {order.paymentMode === "cod" && (order.amountDuePaise ?? 0) > 0 && (
                <>
                  <div className="flex justify-between pt-2 text-emerald-700 font-medium">
                    <dt>Advance Deposit Paid</dt>
                    <dd>{formatINR(order.amountPaidPaise ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between text-amber-800 font-medium">
                    <dt>Cash Due on Delivery</dt>
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

        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3">
          <Link href={`/account/orders/${order.id}`} className="btn-primary font-semibold">Track Order Details</Link>
          <Link href="/products" className="btn-ghost font-semibold">Explore More Sarees</Link>
        </div>
      </Container>
    </div>
  );
}
