import Link from "next/link";
import { AlertTriangle, IndianRupee, PackageCheck, ShoppingBag, Users } from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { orderRepo, productRepo, userRepo } from "@/server/repositories";
import { readCollection } from "@/server/db/json-store";
import type { Product } from "@/types/product";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_CHIP: Record<string, string> = {
  pending: "bg-ink/10 text-ink",
  paid: "bg-gold/10 text-gold",
  packed: "bg-gold/10 text-gold",
  shipped: "bg-emerald-500/10 text-emerald-700",
  delivered: "bg-emerald-500/10 text-emerald-700",
  cancelled: "bg-maroon/10 text-maroon",
  refunded: "bg-maroon/10 text-maroon"
};

export default async function AdminDashboard() {
  const [orders, users, products] = await Promise.all([
    orderRepo.listAll(),
    userRepo.list(),
    readCollection<Product>("products")
  ]);

  const paid = orders.filter((o) => ["paid", "packed", "shipped", "delivered"].includes(o.status));
  const revenuePaise = paid.reduce((n, o) => n + o.totalPaise, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
  const customerCount = users.filter((u) => u.role === "customer").length;

  const lowStock = products
    .flatMap((p) => p.variants.map((v) => ({ product: p, variant: v })))
    .filter(({ variant }) => variant.stock > 0 && variant.stock <= 3);
  const outOfStock = products.flatMap((p) =>
    p.variants.filter((v) => v.stock === 0).map((v) => ({ product: p, variant: v }))
  );

  const recent = orders.slice(0, 8);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Overview</p>
        <h1 className="mt-2 font-display text-3xl">Dashboard</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Revenue (paid)" value={formatINR(revenuePaise)} hint={`${paid.length} paid orders`} icon={IndianRupee} />
        <KpiCard label="Orders today" value={String(todayOrders.length)} hint={`${orders.length} lifetime`} icon={ShoppingBag} />
        <KpiCard label="Customers" value={String(customerCount)} icon={Users} />
        <KpiCard
          label="Low stock"
          value={String(lowStock.length + outOfStock.length)}
          hint={`${outOfStock.length} sold out`}
          tone={outOfStock.length > 0 ? "warn" : lowStock.length > 0 ? "success" : "default"}
          icon={AlertTriangle}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-cream p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-ink-muted hover:text-ink">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border/70">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-ink-muted">
                      {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                      {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${STATUS_CHIP[o.status] ?? "bg-ink/10 text-ink"}`}>
                      {o.status}
                    </span>
                    <span className="font-medium">{formatINR(o.totalPaise)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-card border border-border bg-cream p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Low stock alerts</h2>
            <PackageCheck className="h-4 w-4 text-ink-muted" />
          </div>
          {lowStock.length + outOfStock.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Everything's healthy.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {[...outOfStock, ...lowStock].slice(0, 8).map(({ product, variant }) => (
                <li key={variant.id} className="flex items-center justify-between">
                  <Link href={`/admin/products/${product.id}`} className="hover:underline">
                    <span className="line-clamp-1">{product.name}</span>
                    <span className="text-xs text-ink-muted">{variant.color}</span>
                  </Link>
                  <span
                    className={`text-xs ${variant.stock === 0 ? "text-maroon" : "text-gold"}`}
                  >
                    {variant.stock === 0 ? "sold out" : `${variant.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
