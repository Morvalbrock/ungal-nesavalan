import { orderRepo, userRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const [users, orders] = await Promise.all([userRepo.list(), orderRepo.listAll()]);
  const paidStatuses = new Set(["paid", "packed", "shipped", "delivered"]);
  const spendByUser = new Map<string, { count: number; total: number }>();
  for (const o of orders) {
    if (!paidStatuses.has(o.status)) continue;
    const prev = spendByUser.get(o.userId) ?? { count: 0, total: 0 };
    spendByUser.set(o.userId, { count: prev.count + 1, total: prev.total + o.totalPaise });
  }

  const rows = users
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">People</p>
        <h1 className="mt-2 font-display text-3xl">Customers</h1>
      </header>

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
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-ink-muted">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
