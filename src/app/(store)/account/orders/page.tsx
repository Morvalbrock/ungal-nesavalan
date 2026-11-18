import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/features/auth/session";
import { orderRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { formatISTDate } from "@/lib/datetime";

export const metadata: Metadata = { title: "Orders" };

const STATUS_COLOURS: Record<string, string> = {
  pending: "bg-purple-100 text-purple-900 border border-purple-200",
  paid: "bg-amber-100 text-amber-900 border border-amber-200",
  packed: "bg-purple-100 text-brand-purple border border-purple-200",
  shipped: "bg-blue-100 text-blue-900 border border-blue-200",
  delivered: "bg-emerald-100 text-emerald-900 border border-emerald-200",
  cancelled: "bg-rose-100 text-rose-900 border border-rose-200",
  refunded: "bg-rose-100 text-rose-900 border border-rose-200"
};

export default async function OrdersPage() {
  const session = await getSession();
  const orders = session ? await orderRepo.listByUser(session.userId) : [];

  if (orders.length === 0) {
    return (
      <section>
        <h2 className="font-heritage text-2xl font-bold text-brand-plum">Your Orders</h2>
        <p className="mt-1 text-xs text-purple-900/60">Once you place an order with our master weavers, it will appear here.</p>
        <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/50 p-10 text-center">
          <p className="font-heritage text-xl font-bold text-brand-plum">No orders yet</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex font-semibold">
            Start Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-heritage text-2xl font-bold text-brand-plum">Your Orders</h2>
      <div className="mt-6 grid gap-4">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/account/orders/${o.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white p-5 hover:border-brand-purple hover:shadow-xs transition"
          >
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-brand-purple">{o.orderNumber}</p>
              <p className="mt-1 font-heritage font-bold text-lg text-brand-plum">
                {o.items.length} item{o.items.length === 1 ? "" : "s"} · {formatINR(o.totalPaise)}
              </p>
              <p className="mt-0.5 text-xs text-purple-900/60">
                Placed on {formatISTDate(o.createdAt)}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_COLOURS[o.status] ?? "bg-purple-100 text-purple-900"}`}>
              {o.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
