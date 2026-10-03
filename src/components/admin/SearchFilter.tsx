"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSpec {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface SearchFilterProps {
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: FilterSpec[];
  debounceMs?: number;
}

export function SearchFilter({
  searchKey = "q",
  searchPlaceholder = "Search…",
  filters = [],
  debounceMs = 300
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [term, setTerm] = useState(sp.get(searchKey) ?? "");

  // Keep local input in sync when URL changes externally (back/forward nav)
  useEffect(() => {
    setTerm(sp.get(searchKey) ?? "");
  }, [sp, searchKey]);

  // Debounced URL sync on search typing
  useEffect(() => {
    const current = sp.get(searchKey) ?? "";
    if (term === current) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp);
      if (term) next.set(searchKey, term);
      else next.delete(searchKey);
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    }, debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, debounceMs, pathname, router, searchKey]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(sp);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  function clearAll() {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
    setTerm("");
  }

  const hasAny = term || filters.some((f) => sp.get(f.key));

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-cream p-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-card border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
        />
        {pending && (
          <span className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 animate-pulse rounded-full bg-maroon/60" />
        )}
      </div>

      {filters.map((f) => {
        const current = sp.get(f.key) ?? "all";
        return (
          <label key={f.key} className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="uppercase tracking-widest">{f.label}</span>
            <select
              value={current}
              onChange={(e) => setFilter(f.key, e.target.value)}
              className="rounded-card border border-border bg-white px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="all">All</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                  {typeof o.count === "number" ? ` (${o.count})` : ""}
                </option>
              ))}
            </select>
          </label>
        );
      })}

      {hasAny && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      )}
    </div>
  );
}
