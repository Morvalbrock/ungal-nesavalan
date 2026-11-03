import Link from "next/link";
import { orderRepo, userRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
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
  paymentMode?: string;
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
  const paymentMode = sp.paymentMode; // "all" | "cod" | "prepaid"

  const filtered = orders.filter((o) => {
    if (sp.status && sp.status !== "all" && o.status !== sp.status) return false;
    if (paymentMode && paymentMode !== "all") {
      if (paymentMode === "cod" && o.paymentMode !== "cod") return false;
      if (paymentMode === "prepaid" && o.paymentMode === "cod") return false;
    }
    if (needle) {
      const u = userMap.get(o.userId);
      const hay = `${o.orderNumber} ${u?.name ?? ""} ${u?.email ?? ""} ${o.addressSnapshot?.phone ?? ""}`.toLowerCase();
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

  const statuses = ["all", "pending", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"];

  const buildUrl = (changes: { status?: string; paymentMode?: string }) => {
    const params = new URLSearchParams();
    const nextStatus = changes.status !== undefined ? changes.status : sp.status;
    const nextMode = changes.paymentMode !== undefined ? changes.paymentMode : sp.paymentMode;

    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextMode && nextMode !== "all") params.set("paymentMode", nextMode);
    if (needle) params.set("q", sp.q!);
    if (sp.sort) params.set("sort", sp.sort);
    const qs = params.toString();
    return qs ? `${PATHNAME}?${qs}` : PATHNAME;
  };

  const serializedSp: Record<string, string | undefined> = {
    status: sp.status,
    paymentMode: sp.paymentMode,
    q: sp.q,
    sort: sp.sort,
    page: sp.page,
    perPage: sp.perPage
  };

  const codOrdersCount = orders.filter((o) => o.paymentMode === "cod").length;
  const prepaidOrdersCount = orders.filter((o) => o.paymentMode !== "cod").length;

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

      {/* Payment mode filter tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-ink-muted">Payment Mode:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href={buildUrl({ paymentMode: "all" })}
              className={`rounded-full border px-3 py-1 font-medium transition ${
                !sp.paymentMode || sp.paymentMode === "all"
                  ? "border-ink bg-ink text-cream"
                  : "border-border text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              All Payments · {orders.length}
            </Link>
            <Link
              href={buildUrl({ paymentMode: "cod" })}
              className={`rounded-full border px-3 py-1 font-medium transition ${
                sp.paymentMode === "cod"
                  ? "border-amber-700 bg-amber-700 text-white"
                  : "border-amber-700/30 text-amber-800 hover:border-amber-700 hover:bg-amber-50"
              }`}
            >
              💵 Cash on Delivery (COD) · {codOrdersCount}
            </Link>
            <Link
              href={buildUrl({ paymentMode: "prepaid" })}
              className={`rounded-full border px-3 py-1 font-medium transition ${
                sp.paymentMode === "prepaid"
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-emerald-700/30 text-emerald-800 hover:border-emerald-700 hover:bg-emerald-50"
              }`}
            >
              💳 Prepaid (Online) · {prepaidOrdersCount}
            </Link>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-ink-muted">Status:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {statuses.map((s) => {
              const active = (sp.status ?? "all") === s;
              const count = s === "all"
                ? orders.length
                : orders.filter((o) => o.status === s).length;

              return (
                <Link
                  key={s}
                  href={buildUrl({ status: s })}
                  className={`rounded-full border px-3 py-1 capitalize transition ${
                    active
                      ? "border-ink bg-ink text-cream"
                      : "border-border text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {s} · {count}
                </Link>
              );
            })}
          </div>
        </div>
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
                    {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
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
                <td colSpan={8} className="p-8 text-center text-sm text-ink-muted">
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
