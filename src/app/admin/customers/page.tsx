import { orderRepo, userRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { getSession } from "@/features/auth/session";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { CustomerRoleToggle } from "@/components/admin/CustomerRoleToggle";
import { Pagination, resolvePage, resolvePerPage } from "@/components/admin/Pagination";
import { SortableHeader, parseSort } from "@/components/admin/SortableHeader";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  role?: string;
  sort?: string;
  page?: string;
  perPage?: string;
}

const PATHNAME = "/admin/customers";

const ROLE_BADGE: Record<string, string> = {
  customer: "bg-ink/10 text-ink",
  admin: "bg-maroon/10 text-maroon",
  super_admin: "bg-gold/15 text-gold-deep"
};

export default async function AdminCustomersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [users, orders, session] = await Promise.all([
    userRepo.list(),
    orderRepo.listAll(),
    getSession()
  ]);
  const sp = await searchParams;
  const paidStatuses = new Set(["paid", "packed", "shipped", "delivered"]);
  const spendByUser = new Map<string, { count: number; total: number }>();
  for (const o of orders) {
    if (!paidStatuses.has(o.status)) continue;
    const prev = spendByUser.get(o.userId) ?? { count: 0, total: 0 };
    spendByUser.set(o.userId, { count: prev.count + 1, total: prev.total + o.totalPaise });
  }

  const needle = sp.q?.trim().toLowerCase() ?? "";
  const filtered = users.filter((u) => {
    if (needle) {
      const hay = `${u.name} ${u.email} ${u.phone ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (sp.role && sp.role !== "all" && u.role !== sp.role) return false;
    return true;
  });

  // Sort
  const sort = parseSort(sp.sort, "joined", "desc");
  const sorted = filtered.slice().sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.field) {
      case "spend": {
        const as = spendByUser.get(a.id)?.total ?? 0;
        const bs = spendByUser.get(b.id)?.total ?? 0;
        return (as - bs) * dir;
      }
      case "orders": {
        const ac = spendByUser.get(a.id)?.count ?? 0;
        const bc = spendByUser.get(b.id)?.count ?? 0;
        return (ac - bc) * dir;
      }
      case "name":
        return a.name.localeCompare(b.name) * dir;
      case "joined":
      default:
        return a.createdAt.localeCompare(b.createdAt) * dir;
    }
  });

  // Paginate
  const perPage = resolvePerPage(sp.perPage);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const page = resolvePage(sp.page, totalPages);
  const rows = sorted.slice((page - 1) * perPage, page * perPage);

  const superCount = users.filter((u) => u.role === "super_admin").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.length - adminCount - superCount;

  const isSuperAdmin = session?.role === "super_admin";

  const serializedSp: Record<string, string | undefined> = {
    q: sp.q,
    role: sp.role,
    sort: sp.sort,
    page: sp.page,
    perPage: sp.perPage
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">People</p>
        <h1 className="mt-2 font-display text-3xl">
          Customers
          <span className="ml-3 text-sm font-normal text-ink-muted">
            {sorted.length} of {users.length}
          </span>
        </h1>
      </header>

      <SearchFilter
        searchPlaceholder="Search by name, email, phone…"
        filters={[
          {
            key: "role",
            label: "Role",
            options: [
              { value: "customer", label: "Customer", count: customerCount },
              { value: "admin", label: "Admin", count: adminCount },
              { value: "super_admin", label: "Super admin", count: superCount }
            ]
          }
        ]}
      />

      <div className="overflow-hidden rounded-card border border-border bg-cream">
        <table className="w-full text-sm">
          <thead className="bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
            <tr>
              <SortableHeader field="name" label="Name" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <SortableHeader field="orders" label="Orders" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <SortableHeader field="spend" label="Lifetime spend" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <SortableHeader field="joined" label="Joined" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const s = spendByUser.get(u.id);
              return (
                <tr key={u.id} className="border-t border-border/70">
                  <td className="p-3">
                    <p className="font-medium">{u.name}</p>
                    {u.phone && <p className="text-xs text-ink-muted">{u.phone}</p>}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                        ROLE_BADGE[u.role] ?? "bg-ink/10 text-ink"
                      }`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">{s?.count ?? 0}</td>
                  <td className="p-3">{s ? formatINR(s.total) : "—"}</td>
                  <td className="p-3 text-xs text-ink-muted">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                  <td className="p-3 text-right">
                    <CustomerRoleToggle
                      userId={u.id}
                      userName={u.name}
                      currentRole={u.role}
                      isSelf={session?.userId === u.id}
                      canManage={isSuperAdmin}
                    />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-ink-muted">
                  {users.length === 0 ? "No customers yet." : "No customers match your filters."}
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
