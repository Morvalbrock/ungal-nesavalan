"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import type { Coupon } from "@/types/coupon";
import { CouponForm } from "@/components/admin/CouponForm";
import { toggleCouponActive } from "@/features/admin/actions";
import { formatINR } from "@/lib/utils";

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();

  const refresh = () => {
    setEditing(null);
    setCreating(false);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Marketing</p>
          <h1 className="mt-2 font-display text-3xl">Coupons</h1>
        </div>
        {!creating && !editing && (
          <button type="button" onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New coupon
          </button>
        )}
      </div>

      {creating && <CouponForm onSaved={refresh} />}
      {editing && <CouponForm coupon={editing} onSaved={refresh} />}

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
            {initialCoupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              initialCoupons.map((c) => (
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
                      className="inline-flex items-center gap-1 rounded-card border border-border px-2.5 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
