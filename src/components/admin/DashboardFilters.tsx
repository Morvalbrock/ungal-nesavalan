"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { RANGES } from "@/lib/date-range";

export interface CustomerOption {
  id: string;
  label: string;
}

export interface DashboardFiltersProps {
  customers: CustomerOption[];
}

export function DashboardFilters({ customers }: DashboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const range = sp.get("range") ?? "today";
  const userId = sp.get("userId") ?? "";

  function update(next: Record<string, string | null>) {
    const params = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-cream p-3">
      <div className="flex gap-1 text-xs">
        {RANGES.map((r) => {
          const active = range === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => update({ range: r.value === "today" ? null : r.value })}
              className={
                active
                  ? "rounded-full border border-ink bg-ink px-3 py-1 text-cream"
                  : "rounded-full border border-border px-3 py-1 text-ink-soft hover:border-ink hover:text-ink"
              }
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <label className="ml-auto flex items-center gap-2 text-xs text-ink-muted">
        <span className="uppercase tracking-widest">Customer</span>
        <select
          value={userId}
          onChange={(e) => update({ userId: e.target.value || null })}
          className="min-w-[220px] rounded-card border border-border bg-white px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
        >
          <option value="">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      {pending && <span className="h-2 w-2 animate-pulse rounded-full bg-maroon/60" aria-hidden />}
    </div>
  );
}

