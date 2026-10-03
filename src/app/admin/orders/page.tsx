import Link from "next/link";
import { orderRepo, userRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { Pagination, resolvePage, resolvePerPage } from "@/components/admin/Pagination";
import { SortableHeader, parseSort } from "@/components/admin/SortableHeader";
import {
  BulkCheckbox,
  BulkSelectAllCheckbox,
  BulkSelectInit
} from "@/components/admin/BulkSelect";
import { OrderBulkActions } from "@/components/admin/OrderBulkActions";

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
  sort?: string;
  page?: string;
  perPage?: string;
}

const PATHNAME = "/admin/orders";

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

  // Sort
  const sort = parseSort(sp.sort, "created", "desc");
  const sorted = filtered.slice().sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.field) {
      case "total":
        return (a.totalPaise - b.totalPaise) * dir;
      case "status":
        return a.status.localeCompare(b.status) * dir;
      case "created":
      default:
        return a.createdAt.localeCompare(b.createdAt) * dir;
    }
  });

  // Paginate
  const perPage = resolvePerPage(sp.perPage);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const page = resolvePage(sp.page, totalPages);
  const pageSlice = sorted.slice((page - 1) * perPage, page * perPage);
  const pageIds = pageSlice.map((o) => o.id);

  const statuses = ["all", "pending", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"];

  const serializedSp: Record<string, string | undefined> = {
    status: sp.status,
    q: sp.q,
    sort: sp.sort,
    page: sp.page,
    perPage: sp.perPage
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Sales</p>
        <h1 className="mt-2 font-display text-3xl">
          Orders
          <span className="ml-3 text-sm font-normal text-ink-muted">
            {sorted.length} of {orders.length}
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

      <BulkSelectInit ids={pageIds} />

      <div className="overflow-hidden rounded-card border border-border bg-cream">
        <table className="w-full text-sm">
          <thead className="bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="w-10 p-3">
                <BulkSelectAllCheckbox />
              </th>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <SortableHeader field="total" label="Total" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <SortableHeader field="status" label="Status" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <SortableHeader field="created" label="Created" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((o) => {
              const u = userMap.get(o.userId);
              return (
                <tr key={o.id} className="border-t border-border/70">
                  <td className="p-3">
                    <BulkCheckbox id={o.id} />
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{o.orderNumber}</p>
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
                  <td className="p-3 text-xs text-ink-muted">
                    {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs text-ink-muted hover:text-ink">
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {pageSlice.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-ink-muted">
                  No orders match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        perPage={perPage}
        total={sorted.length}
        pathname={PATHNAME}
        searchParams={serializedSp}
      />

      <OrderBulkActions />
    </div>
  );
}
