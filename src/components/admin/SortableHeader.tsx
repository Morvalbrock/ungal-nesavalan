"use client";

import { useRouter } from "next/navigation";
import { useTransition, useEffect } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useAdminListLoadingStore } from "@/features/admin/list-loading.store";
import type { SortDir, SortSpec } from "./sort-utils";

export type { SortDir, SortSpec } from "./sort-utils";
export { parseSort } from "./sort-utils";

export interface SortableHeaderProps {
  field: string;
  label: string;
  current: SortSpec;
  pathname: string;
  searchParams: Record<string, string | undefined>;
  className?: string;
}

export function SortableHeader({
  field,
  label,
  current,
  pathname,
  searchParams,
  className
}: SortableHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const startLoading = useAdminListLoadingStore((s) => s.startLoading);
  const stopLoading = useAdminListLoadingStore((s) => s.stopLoading);

  useEffect(() => {
    if (!pending) stopLoading();
  }, [pending, stopLoading]);

  const isActive = current.field === field;
  const nextDir: SortDir = isActive && current.dir === "asc" ? "desc" : "asc";

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v != null && v !== "" && k !== "sort" && k !== "page") params.set(k, v);
  }
  params.set("sort", `${field}-${nextDir}`);
  const href = `${pathname}?${params.toString()}`;

  const Icon = !isActive ? ArrowUpDown : current.dir === "asc" ? ArrowUp : ArrowDown;

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (cmd/ctrl/shift/middle) fall through to default navigation
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    startLoading(`sort:${field}`);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    <th className={`p-3 ${className ?? ""}`}>
      <a
        href={href}
        onClick={onClick}
        className={`inline-flex items-center gap-1 transition-colors ${
          isActive ? "text-ink" : "text-ink-muted hover:text-ink"
        }`}
      >
        {label}
        <Icon className="h-3 w-3" />
      </a>
    </th>
  );
}
