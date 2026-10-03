"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Search } from "lucide-react";
import type { Coupon } from "@/types/coupon";
import { CouponForm } from "@/components/admin/CouponForm";
import { deleteCoupon, toggleCouponActive } from "@/features/admin/actions";
import { formatINR } from "@/lib/utils";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

type ActiveFilter = "all" | "active" | "inactive";

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ActiveFilter>("all");
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setEditing(null);
    setCreating(false);
    router.refresh();
  };

  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    return initialCoupons.filter((c) => {
      if (filter === "active" && !c.active) return false;
      if (filter === "inactive" && c.active) return false;
      if (n && !c.code.toLowerCase().includes(n)) return false;
      return true;
    });
  }, [initialCoupons, search, filter]);

  function doDelete() {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setError(null);
    startTransition(async () => {
      const res = await deleteCoupon(id);
      if (!res.ok) {
        setError(res.error ?? "failed");
        return;
      }
      setConfirmDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Marketing</p>
          <h1 className="mt-2 font-display text-3xl">
            Coupons
            <span className="ml-3 text-sm font-normal text-ink-muted">
              {filtered.length} of {initialCoupons.length}
            </span>
          </h1>
        </div>
        {!creating && !editing && (
          <button type="button" onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New coupon
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-cream p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code…"
            className="w-full rounded-card border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="uppercase tracking-widest">Status</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActiveFilter)}
            className="rounded-card border border-border bg-white px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      {creating && <CouponForm onSaved={refresh} />}
      {editing && <CouponForm coupon={editing} onSaved={refresh} />}

      {error && (
        <div className="rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-border">
        <table className="min-w-full divide-y divide-border/70 text-sm">
          <thead className="bg-cream-warm text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Min subtotal</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  {initialCoupons.length === 0 ? "No coupons yet." : "No coupons match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.kind === "percent" ? `${c.value}% off` : `${formatINR(c.value)} off`}
                  </td>
                  <td className="px-4 py-3">{c.minSubtotalPaise ? formatINR(c.minSubtotalPaise) : "—"}</td>
                  <td className="px-4 py-3">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await toggleCouponActive(c.id, !c.active);
                          router.refresh();
                        })
                      }
                      className={
                        c.active
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                          : "rounded-full bg-border/70 px-2 py-0.5 text-xs text-ink-muted"
                      }
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(c)}
                      className="mr-2 inline-flex items-center gap-1 rounded-card border border-border px-2.5 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(c)}
                      className="inline-flex items-center gap-1 rounded-card border border-maroon/40 px-2.5 py-1 text-xs text-maroon hover:bg-maroon/5"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmDelete !== null}
        title="Delete coupon?"
        body={confirmDelete ? `Coupon "${confirmDelete.code}" will be permanently removed.` : ""}
        confirmLabel="Delete"
        danger
        busy={pending}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
