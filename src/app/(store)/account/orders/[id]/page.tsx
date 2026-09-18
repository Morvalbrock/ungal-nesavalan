import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/features/auth/session";
import { orderRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Order detail" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) notFound();
  const { id } = await params;
  const order = await orderRepo.findById(id);
  if (!order || order.userId !== session.userId) notFound();

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
              <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd>{order.shippingPaise === 0 ? "Free" : formatINR(order.shippingPaise)}</dd></div>
              <div className="flex justify-between border-t border-border/70 pt-2 font-medium"><dt>Total</dt><dd>{formatINR(order.totalPaise)}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
