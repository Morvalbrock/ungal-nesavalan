import { shippingChargesRepo } from "@/server/repositories";
import { INDIAN_STATES } from "@/features/checkout/checkout.schema";
import { ShippingChargesTable } from "@/components/admin/ShippingChargesTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shipping charges" };

export default async function AdminShippingChargesPage() {
  const [existing, defaults] = await Promise.all([
    shippingChargesRepo.list(),
    shippingChargesRepo.getDefaults()
  ]);

  const byState = new Map(existing.map((r) => [r.state, r]));
  const initialRows = INDIAN_STATES.map((state) => {
    const row = byState.get(state);
    return {
      state,
      chargePaise: row?.chargePaise ?? null,
      freeAbovePaise: row?.freeAbovePaise ?? null,
      active: row?.active ?? true
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Logistics</p>
        <h1 className="mt-2 font-display text-3xl">Shipping charges</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Set a per-state shipping charge and an optional &ldquo;free above&rdquo; threshold.
          Unlisted or inactive states fall back to the default charge below, and the customer
          sees a soft notice asking them to contact support.
        </p>
      </div>

      <ShippingChargesTable
        initialRows={initialRows}
        initialDefaults={{
          defaultChargePaise: defaults.defaultChargePaise,
          defaultFreeAbovePaise: defaults.defaultFreeAbovePaise
        }}
      />
    </div>
  );
}
