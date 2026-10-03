import Link from "next/link";
import { orderRepo, userRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { SearchFilter } from "@/components/admin/SearchFilter";

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
  status?: string;
  q?: string;
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [orders, users] = await Promise.all([orderRepo.listAll(), userRepo.list()]);
  const sp = await searchParams;
  const userMap = new Map(users.map((u) => [u.id, u]));

  const needle = sp.q?.trim().toLowerCase() ?? "";
  const filtered = orders.filter((o) => {
    if (sp.status && o.status !== sp.status) return false;
    if (needle) {
      const u = userMap.get(o.userId);
      const hay = `${o.orderNumber} ${u?.name ?? ""} ${u?.email ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const statuses = ["all", "pending", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Sales</p>
        <h1 className="mt-2 font-display text-3xl">
          Orders
          <span className="ml-3 text-sm font-normal text-ink-muted">
            {filtered.length} of {orders.length}
          </span>
        </h1>
      </header>

      <SearchFilter searchPlaceholder="Search by order number, customer name or email…" />

      <div className="flex flex-wrap gap-2 text-xs">
        {statuses.map((s) => {
          const params = new URLSearchParams();
          if (s !== "all") params.set("status", s);
          if (needle) params.set("q", sp.q!);
          const qs = params.toString();
          const href = qs ? `/admin/orders?${qs}` : "/admin/orders";
          const active = (sp.status ?? "all") === s;
          return (
            <Link
              key={s}
              href={href}
              className={`rounded-full border px-3 py-1 capitalize ${
                active ? "border-ink bg-ink text-cream" : "border-border text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {s} · {s === "all" ? orders.length : orders.filter((o) => o.status === s).length}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-cream">
        <table className="w-full text-sm">
          <thead className="bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const u = userMap.get(o.userId);
              return (
                <tr key={o.id} className="border-t border-border/70">
                  <td className="p-3">
                    <p className="font-medium">{o.orderNumber}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </td>
                  <td className="p-3">
                    <p>{u?.name ?? "—"}</p>
                    <p className="text-xs text-ink-muted">{u?.email ?? ""}</p>
                  </td>
                  <td className="p-3">{o.items.length}</td>
                  <td className="p-3">{formatINR(o.totalPaise)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${STATUS_CHIP[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs text-ink-muted hover:text-ink">
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-ink-muted">
                  No orders match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
