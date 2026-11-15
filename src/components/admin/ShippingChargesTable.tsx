"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkUpsertShippingCharges } from "@/features/admin/actions";
import { INDIAN_STATES } from "@/features/checkout/checkout.schema";
import { cn } from "@/lib/utils";

type StateName = (typeof INDIAN_STATES)[number];

type RowInput = {
  state: StateName;
  chargePaise: number | null;
  freeAbovePaise: number | null;
  active: boolean;
};

type DefaultsInput = {
  defaultChargePaise: number;
  defaultFreeAbovePaise: number | null;
};

type RowDraft = {
  state: StateName;
  chargeRupees: string;
  freeAboveRupees: string;
  active: boolean;
};

type DefaultsDraft = {
  defaultChargeRupees: string;
  defaultFreeAboveRupees: string;
};

const paiseToRupeeString = (p: number | null | undefined): string =>
  p === null || p === undefined ? "" : String(Math.round(p / 100));

const rupeeStringToPaise = (s: string): number | null => {
  const trimmed = s.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
};

export function ShippingChargesTable({
  initialRows,
  initialDefaults
}: {
  initialRows: RowInput[];
  initialDefaults: DefaultsInput;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<RowDraft[]>(() =>
    initialRows.map((r) => ({
      state: r.state,
      chargeRupees: paiseToRupeeString(r.chargePaise),
      freeAboveRupees: paiseToRupeeString(r.freeAbovePaise),
      active: r.active
    }))
  );
  const [defaults, setDefaults] = useState<DefaultsDraft>(() => ({
    defaultChargeRupees: paiseToRupeeString(initialDefaults.defaultChargePaise),
    defaultFreeAboveRupees: paiseToRupeeString(initialDefaults.defaultFreeAbovePaise)
  }));
  const [banner, setBanner] = useState<{ kind: "ok" | "error"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState("");

  const updateRow = (idx: number, patch: Partial<RowDraft>) =>
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const applyToAll = () => {
    const chargeRupees = defaults.defaultChargeRupees;
    const freeAboveRupees = defaults.defaultFreeAboveRupees;
    setRows((rs) => rs.map((r) => ({ ...r, chargeRupees, freeAboveRupees })));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    const defaultChargePaise = rupeeStringToPaise(defaults.defaultChargeRupees);
    if (defaultChargePaise === null) {
      setBanner({ kind: "error", message: "Default charge is required." });
      return;
    }

    const payloadRows = rows.map((r) => ({
      state: r.state,
      chargePaise: rupeeStringToPaise(r.chargeRupees) ?? 0,
      freeAbovePaise: rupeeStringToPaise(r.freeAboveRupees),
      active: r.active
    }));

    startTransition(async () => {
      const res = await bulkUpsertShippingCharges({
        defaults: {
          defaultChargePaise,
          defaultFreeAbovePaise: rupeeStringToPaise(defaults.defaultFreeAboveRupees)
        },
        rows: payloadRows
      });
      if (res.ok) {
        setBanner({ kind: "ok", message: "Shipping charges saved." });
        router.refresh();
      } else {
        setBanner({
          kind: "error",
          message: res.error === "invalid_input" ? "Please fix the highlighted fields." : res.error
        });
      }
    });
  };

  const visibleRows = filter.trim()
    ? rows
        .map((r, idx) => ({ r, idx }))
        .filter(({ r }) => r.state.toLowerCase().includes(filter.trim().toLowerCase()))
    : rows.map((r, idx) => ({ r, idx }));

  return (
    <form onSubmit={submit} className="space-y-5">
      {banner && (
        <div
          className={cn(
            "rounded-card border p-3 text-sm",
            banner.kind === "ok"
              ? "border-emerald-600/40 bg-emerald-50 text-emerald-800"
              : "border-maroon/40 bg-maroon/5 text-maroon"
          )}
        >
          {banner.message}
        </div>
      )}

      {/* Defaults card */}
      <section className="rounded-card border border-border bg-cream p-5">
        <header className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg">Fallback for unlisted states</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Applied when the customer&apos;s state has no active row below.
            </p>
          </div>
          <button
            type="button"
            onClick={applyToAll}
            className="rounded-card border border-border bg-transparent px-3 py-1.5 text-xs text-ink hover:bg-border/40"
          >
            Apply these to all states
          </button>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default charge (₹)" required>
            <input
              type="number"
              min={0}
              step={1}
              value={defaults.defaultChargeRupees}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, defaultChargeRupees: e.target.value }))
              }
              className={inputCls}
              placeholder="99"
            />
          </Field>
          <Field label="Default free above (₹)" hint="Blank = no free-shipping threshold">
            <input
              type="number"
              min={0}
              step={1}
              value={defaults.defaultFreeAboveRupees}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, defaultFreeAboveRupees: e.target.value }))
              }
              className={inputCls}
              placeholder="5000"
            />
          </Field>
        </div>
      </section>

      {/* Per-state table */}
      <section className="rounded-card border border-border bg-cream">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <h2 className="font-display text-lg">Per-state rates</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Leave &ldquo;Free above&rdquo; blank for no free-shipping threshold on that state.
            </p>
          </div>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter state…"
            className={cn(inputCls, "max-w-xs")}
          />
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-border/30 text-left text-[11px] uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">State</th>
                <th className="px-4 py-2 font-medium">Charge (₹)</th>
                <th className="px-4 py-2 font-medium">Free above (₹)</th>
                <th className="px-4 py-2 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ r, idx }) => (
                <tr key={r.state} className="border-t border-border/60">
                  <td className="px-4 py-2 font-medium text-ink">{r.state}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={r.chargeRupees}
                      onChange={(e) => updateRow(idx, { chargeRupees: e.target.value })}
                      className={cn(inputCls, "max-w-[140px]")}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={r.freeAboveRupees}
                      onChange={(e) => updateRow(idx, { freeAboveRupees: e.target.value })}
                      className={cn(inputCls, "max-w-[140px]")}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={r.active}
                        onChange={(e) => updateRow(idx, { active: e.target.checked })}
                      />
                      <span className="text-xs text-ink-muted">
                        {r.active ? "On" : "Off"}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-muted">
                    No states match &ldquo;{filter}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-cream/95 px-4 py-3 backdrop-blur">
        <span className="text-xs text-ink-muted">{rows.length} states</span>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : "Save all changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
        {required && <span className="ml-1 text-maroon">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}

const inputCls = cn(
  "w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-ink"
);
