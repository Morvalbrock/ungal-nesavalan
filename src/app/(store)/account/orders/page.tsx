import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/features/auth/session";
import { orderRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const STATUS_COLOURS: Record<string, string> = {
  pending: "bg-ink/10 text-ink",
  paid: "bg-gold/10 text-gold",
  packed: "bg-gold/10 text-gold",
  shipped: "bg-emerald-500/10 text-emerald-700",
  delivered: "bg-emerald-500/10 text-emerald-700",
  cancelled: "bg-maroon/10 text-maroon",
  refunded: "bg-maroon/10 text-maroon"
};

export default async function OrdersPage() {
  const session = await getSession();
  const orders = session ? await orderRepo.listByUser(session.userId) : [];

  if (orders.length === 0) {
    return (
      <section>
        <h2 className="font-display text-2xl">Orders</h2>
        <p className="mt-1 text-sm text-ink-muted">Once you place an order, it will appear here.</p>
        <div className="mt-6 rounded-card border border-border/70 bg-cream-warm/40 p-10 text-center">
          <p className="font-display text-xl">No orders yet</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex">
            Start shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-display text-2xl">Orders</h2>
      <div className="mt-6 grid gap-4">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/account/orders/${o.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border p-5 hover:border-ink"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted">{o.orderNumber}</p>
              <p className="mt-1 font-display text-lg">
                {o.items.length} item{o.items.length === 1 ? "" : "s"} · {formatINR(o.totalPaise)}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Placed {new Date(o.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${STATUS_COLOURS[o.status] ?? "bg-ink/10 text-ink"}`}>
              {o.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
