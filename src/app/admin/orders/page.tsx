import Link from "next/link";
import { Star } from "lucide-react";
import { orderRepo, userRepo } from "@/server/repositories";
import { readCollection } from "@/server/db/json-store";
import type { Review } from "@/types/review";
import { formatINR } from "@/lib/utils";
import { formatIST } from "@/lib/datetime";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { Pagination, resolvePage, resolvePerPage } from "@/components/admin/Pagination";
import { SortableHeader, parseSort } from "@/components/admin/SortableHeader";
import { ExportLink } from "@/components/admin/ExportLink";

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

  // Customer feedback (product reviews) only make sense after delivery, so load them only
  // for the Delivered tab and index by orderId for an O(1) lookup during row render.
  const showFeedback = (sp.status?.trim() || "prepaid") === "delivered";
  const reviewsByOrder = new Map<string, { avg: number; count: number }>();
  if (showFeedback) {
    const reviews = await readCollection<Review>("reviews");
    const buckets = new Map<string, Review[]>();
    for (const r of reviews) {
      const bucket = buckets.get(r.orderId) ?? [];
      bucket.push(r);
      buckets.set(r.orderId, bucket);
    }
    for (const [orderId, rows] of buckets) {
      const sum = rows.reduce((acc, r) => acc + r.rating, 0);
      reviewsByOrder.set(orderId, { avg: sum / rows.length, count: rows.length });
    }
  }

  const needle = sp.q?.trim().toLowerCase() ?? "";

  // Unified single-row filter. One of these values is active at any time:
  //   "prepaid" (default) → Full Paid: paymentMode != cod, captured, still in-flight (not delivered/cancelled/refunded)
  //   "cod"               → Cash on Delivery: paymentMode == cod, deposit captured, still in-flight
  //   "pending"           → every order whose payment hasn't been captured yet (status == "pending")
  //   "delivered"         → delivered orders; this is where customer feedback / ratings surface
  //   "all"               → every order regardless of payment/status
  //   any other status    → filter by that status (packed, shipped, cancelled, refunded)
  // Default-on-load = prepaid so the finance/dispatch workflow starts with ready-to-ship orders.
  const filter = sp.status?.trim() || "prepaid";

  // "Active" (in-flight) orders for Full Paid / COD = payment captured AND not yet closed out.
  // Delivered, cancelled, and refunded orders don't need operator attention on those tabs.
  const INFLIGHT_STATUSES = new Set(["paid", "packed", "shipped", "return_requested"]);
  const isPrepaidActive = (o: (typeof orders)[number]) =>
    o.paymentMode !== "cod" && INFLIGHT_STATUSES.has(o.status);
  const isCodActive = (o: (typeof orders)[number]) =>
    o.paymentMode === "cod" && INFLIGHT_STATUSES.has(o.status);

  const filtered = orders.filter((o) => {
    if (filter === "all") return matchesSearch(o);
    if (filter === "prepaid") return isPrepaidActive(o) && matchesSearch(o);
    if (filter === "cod") return isCodActive(o) && matchesSearch(o);
    if (o.status !== filter) return false;
    return matchesSearch(o);
  });

  function matchesSearch(o: (typeof orders)[number]) {
    if (!needle) return true;
    const u = userMap.get(o.userId);
    const hay = `${o.orderNumber} ${u?.name ?? ""} ${u?.email ?? ""} ${o.addressSnapshot?.phone ?? ""}`.toLowerCase();
    return hay.includes(needle);
  }

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

  // Single filter row: Full Paid (default) → COD → Pending → rest of status flow.
  const filterTabs: { key: string; label: string; count: number; tone: "prepaid" | "cod" | "status" | "all" }[] = [
    {
      key: "prepaid",
      label: "Full Paid",
      count: orders.filter(isPrepaidActive).length,
      tone: "prepaid"
    },
    {
      key: "cod",
      label: "COD",
      count: orders.filter(isCodActive).length,
      tone: "cod"
    },
    { key: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length, tone: "status" },
    { key: "packed", label: "Packed", count: orders.filter((o) => o.status === "packed").length, tone: "status" },
    { key: "shipped", label: "Shipped", count: orders.filter((o) => o.status === "shipped").length, tone: "status" },
    { key: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length, tone: "status" },
    { key: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length, tone: "status" },
    { key: "refunded", label: "Refunded", count: orders.filter((o) => o.status === "refunded").length, tone: "status" },
    { key: "all", label: "All", count: orders.length, tone: "all" }
  ];

  const buildUrl = (filterKey: string) => {
    const params = new URLSearchParams();
    // "prepaid" is the default view, so we omit the param entirely to keep the URL clean.
    if (filterKey !== "prepaid") params.set("status", filterKey);
    if (needle) params.set("q", sp.q!);
    if (sp.sort) params.set("sort", sp.sort);
    const qs = params.toString();
    return qs ? `${PATHNAME}?${qs}` : PATHNAME;
  };

  const serializedSp: Record<string, string | undefined> = {
    status: sp.status,
    q: sp.q,
    sort: sp.sort,
    page: sp.page,
    perPage: sp.perPage
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Sales</p>
          <h1 className="mt-2 font-display text-3xl">
            Orders
            <span className="ml-3 text-sm font-normal text-ink-muted">
              {sorted.length} of {orders.length}
            </span>
          </h1>
        </div>
        <ExportLink entity="orders" />
      </header>

      <SearchFilter searchPlaceholder="Search by order number, customer name, email or phone…" />

      {/* Unified single-row filter: Full Paid (default) → COD → Pending → rest */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {filterTabs.map((tab) => {
          const active = filter === tab.key;
          const activeCls =
            tab.tone === "prepaid"
              ? "border-emerald-700 bg-emerald-700 text-white"
              : tab.tone === "cod"
                ? "border-amber-700 bg-amber-700 text-white"
                : "border-ink bg-ink text-cream";
          const idleCls =
            tab.tone === "prepaid"
              ? "border-emerald-700/30 text-emerald-800 hover:border-emerald-700 hover:bg-emerald-50"
              : tab.tone === "cod"
                ? "border-amber-700/30 text-amber-800 hover:border-amber-700 hover:bg-amber-50"
                : "border-border text-ink-soft hover:border-ink hover:text-ink";
          const icon = tab.tone === "prepaid" ? "💳 " : tab.tone === "cod" ? "💵 " : "";

          return (
            <Link
              key={tab.key}
              href={buildUrl(tab.key)}
              className={`rounded-full border px-3 py-1 font-medium transition ${active ? activeCls : idleCls}`}
            >
              {icon}
              {tab.label} · {tab.count}
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
              <th className="p-3">Payment</th>
              <th className="p-3">Items</th>
              <SortableHeader field="total" label="Total" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <SortableHeader field="status" label="Status" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <SortableHeader field="created" label="Created" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              {showFeedback && <th className="p-3">Feedback</th>}
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((o) => {
              const u = userMap.get(o.userId);
              const isCod = o.paymentMode === "cod";
              return (
                <tr key={o.id} className="border-t border-border/70 hover:bg-cream-warm/40 transition">
                  <td className="p-3">
                    <p className="font-medium text-ink">{o.orderNumber}</p>
                    {o.courier && (
                      <p className="text-[11px] text-ink-muted">{o.courier}</p>
                    )}
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-ink">{u?.name || o.addressSnapshot?.fullName || "—"}</p>
                    <p className="text-xs text-ink-muted">{u?.email || o.addressSnapshot?.phone || ""}</p>
                  </td>
                  <td className="p-3">
                    {isCod ? (
                      <span className="inline-flex flex-col gap-0.5">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                          💵 COD
                        </span>
                        {(o.amountDuePaise ?? 0) > 0 ? (
                          <span className="text-[10px] text-maroon font-medium">
                            Due: {formatINR(o.amountDuePaise ?? 0)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700">
                            Collected
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-800">
                        💳 Prepaid
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-ink-muted">{o.items.length}</td>
                  <td className="p-3 font-medium">{formatINR(o.totalPaise)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium ${STATUS_CHIP[o.status] ?? "bg-ink/10 text-ink"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-ink-muted">
                    {formatIST(o.createdAt)}
                  </td>
                  {showFeedback && (
                    <td className="p-3 text-xs">
                      {(() => {
                        const r = reviewsByOrder.get(o.id);
                        if (!r) return <span className="text-ink-muted">No review yet</span>;
                        return (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 font-medium text-gold">
                            <Star className="h-3 w-3 fill-current" />
                            {r.avg.toFixed(1)} · {r.count}
                          </span>
                        );
                      })()}
                    </td>
                  )}
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="rounded border border-border px-2.5 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink transition"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {pageSlice.length === 0 && (
              <tr>
                <td colSpan={showFeedback ? 9 : 8} className="p-8 text-center text-sm text-ink-muted">
                  No orders match your selected filters.
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
    </div>
  );
}
