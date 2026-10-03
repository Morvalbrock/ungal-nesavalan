import { orderRepo, userRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";
import { getSession } from "@/features/auth/session";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { CustomerRoleToggle } from "@/components/admin/CustomerRoleToggle";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  role?: string;
}

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

  const rows = filtered.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.length - adminCount;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">People</p>
        <h1 className="mt-2 font-display text-3xl">
          Customers
          <span className="ml-3 text-sm font-normal text-ink-muted">
            {rows.length} of {users.length}
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
              { value: "admin", label: "Admin", count: adminCount }
            ]
          }
        ]}
      />

      <div className="overflow-hidden rounded-card border border-border bg-cream">
        <table className="w-full text-sm">
          <thead className="bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Lifetime spend</th>
              <th className="p-3">Joined</th>
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
                        u.role === "admin" ? "bg-maroon/10 text-maroon" : "bg-ink/10 text-ink"
                      }`}
                    >
                      {u.role}
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
    </div>
  );
}
