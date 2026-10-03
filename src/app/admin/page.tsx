import Link from "next/link";
import { AlertTriangle, IndianRupee, PackageCheck, ShoppingBag, ShoppingCart, UserPlus, Users } from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { DashboardFilters } from "@/components/admin/DashboardFilters";
import { resolveRange } from "@/lib/date-range";
import { abandonedCartRepo, orderRepo, userRepo } from "@/server/repositories";
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

interface SearchParams {
  range?: string;
  userId?: string;
}

export default async function AdminDashboard({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [orders, users, products, abandoned] = await Promise.all([
    orderRepo.listAll(),
    userRepo.list(),
    readCollection<Product>("products"),
    abandonedCartRepo.listActive()
  ]);
  const sp = await searchParams;
  const { from, label: rangeLabel } = resolveRange(sp.range);
  const userId = sp.userId?.trim() || null;

  const inRange = (iso: string) => (from ? new Date(iso) >= from : true);
  const matchesUser = (uid: string) => (userId ? uid === userId : true);

  const rangeOrders = orders.filter((o) => inRange(o.createdAt) && matchesUser(o.userId));
  const paidInRange = rangeOrders.filter((o) =>
    ["paid", "packed", "shipped", "delivered"].includes(o.status)
  );
  const revenuePaise = paidInRange.reduce((n, o) => n + o.totalPaise, 0);

  const pendingOrders = rangeOrders.filter((o) => o.status === "pending" || o.status === "paid");

  const newSignups = users.filter((u) => inRange(u.createdAt) && matchesUser(u.id));

  const rangeAbandoned = abandoned.filter(
    (a) => !a.recoveredOrderId && inRange(a.updatedAt) && matchesUser(a.userId)
  );

  const lowStock = products
    .flatMap((p) => p.variants.map((v) => ({ product: p, variant: v })))
    .filter(({ variant }) => variant.stock > 0 && variant.stock <= 3);
  const outOfStock = products.flatMap((p) =>
    p.variants.filter((v) => v.stock === 0).map((v) => ({ product: p, variant: v }))
  );

  const recent = rangeOrders.slice(0, 8);
  const selectedCustomer = userId ? users.find((u) => u.id === userId) : null;

  const customerOptions = users
    .filter((u) => u.role !== "super_admin")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((u) => ({ id: u.id, label: `${u.name} · ${u.email}` }));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Overview</p>
        <h1 className="mt-2 font-display text-3xl">
          Dashboard
          <span className="ml-3 text-sm font-normal text-ink-muted">
            {rangeLabel}
            {selectedCustomer && (
              <>
                {" · "}
                <span className="text-ink">{selectedCustomer.name}</span>
              </>
            )}
          </span>
        </h1>
      </header>

      <DashboardFilters customers={customerOptions} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={formatINR(revenuePaise)}
          hint={`${paidInRange.length} paid order${paidInRange.length === 1 ? "" : "s"}`}
          icon={IndianRupee}
        />
        <KpiCard
          label="Orders"
          value={String(rangeOrders.length)}
          hint={pendingOrders.length > 0 ? `${pendingOrders.length} need action` : "nothing pending"}
          tone={pendingOrders.length > 0 ? "warn" : "default"}
          icon={ShoppingBag}
        />
        <KpiCard
          label="New customers"
          value={String(newSignups.length)}
          icon={UserPlus}
        />
        <KpiCard
          label="Abandoned carts"
          value={String(rangeAbandoned.length)}
          hint={rangeAbandoned.length > 0 ? "awaiting recovery" : "none"}
          tone={rangeAbandoned.length > 0 ? "warn" : "default"}
          icon={ShoppingCart}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Low stock"
          value={String(lowStock.length + outOfStock.length)}
          hint={`${outOfStock.length} sold out`}
          tone={outOfStock.length > 0 ? "warn" : lowStock.length > 0 ? "success" : "default"}
          icon={AlertTriangle}
        />
        <KpiCard
          label="Customers (all)"
          value={String(users.filter((u) => u.role === "customer").length)}
          hint="not time-filtered"
          icon={Users}
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
            <p className="mt-4 text-sm text-ink-muted">No orders in this range.</p>
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
