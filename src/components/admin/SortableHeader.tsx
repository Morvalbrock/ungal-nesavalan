import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export type SortDir = "asc" | "desc";

export interface SortSpec {
  field: string;
  dir: SortDir;
}

export function parseSort(raw: string | undefined, defaultField: string, defaultDir: SortDir = "desc"): SortSpec {
  if (!raw) return { field: defaultField, dir: defaultDir };
  const [field, dir] = raw.split("-");
  if (!field) return { field: defaultField, dir: defaultDir };
  return { field, dir: dir === "asc" ? "asc" : "desc" };
}

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
  const isActive = current.field === field;
  const nextDir: SortDir = isActive && current.dir === "asc" ? "desc" : "asc";

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v != null && v !== "" && k !== "sort" && k !== "page") params.set(k, v);
  }
  params.set("sort", `${field}-${nextDir}`);
  const href = `${pathname}?${params.toString()}`;

  const Icon = !isActive ? ArrowUpDown : current.dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <th className={`p-3 ${className ?? ""}`}>
      <Link
        href={href}
        scroll={false}
        className={`inline-flex items-center gap-1 transition-colors ${
          isActive ? "text-ink" : "text-ink-muted hover:text-ink"
        }`}
      >
        {label}
        <Icon className="h-3 w-3" />
      </Link>
    </th>
  );
}
