import { abandonedCartRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Abandoned carts" };

export default async function AdminAbandonedCartsPage() {
  const carts = await abandonedCartRepo.listActive();
  const now = Date.now();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Recovery</p>
        <h1 className="mt-2 font-display text-3xl">Abandoned carts</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Logged-in shoppers who reached checkout with items but didn't complete. The recovery email trigger arrives in Phase 9.3.
        </p>
      </div>

      <div className="overflow-hidden rounded-card border border-border">
        <table className="min-w-full divide-y divide-border/70 text-sm">
          <thead className="bg-cream-warm text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
              <th className="px-4 py-3 text-left">Age</th>
              <th className="px-4 py-3 text-left">Notified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {carts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">No active abandoned carts.</td>
              </tr>
            ) : (
              carts.map((c) => {
                const ageHours = Math.round((now - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60));
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3">
                      {c.items.length} · {c.items.slice(0, 2).map((i) => i.name).join(", ")}
                      {c.items.length > 2 && "…"}
                    </td>
                    <td className="px-4 py-3 text-right">{formatINR(c.subtotalPaise)}</td>
                    <td className="px-4 py-3 text-ink-muted">{ageHours < 1 ? "just now" : `${ageHours}h`}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {c.notifiedAt ? new Date(c.notifiedAt).toLocaleString("en-IN") : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
