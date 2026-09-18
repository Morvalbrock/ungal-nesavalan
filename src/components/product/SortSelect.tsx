"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/features/products/filters";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "featured";

  const onChange = (value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value === "featured") next.delete("sort");
    else next.set("sort", value);
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-muted">Sort</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-card border border-border bg-transparent px-3 py-1.5 text-sm focus:border-ink focus:outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
