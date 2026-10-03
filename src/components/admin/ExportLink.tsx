"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

export interface ExportLinkProps {
  entity: "products" | "orders" | "customers";
  label?: string;
}

const DROP_PARAMS = new Set(["page", "perPage"]);

export function ExportLink({ entity, label = "Export CSV" }: ExportLinkProps) {
  const sp = useSearchParams();
  const params = new URLSearchParams();
  for (const [k, v] of sp.entries()) {
    if (DROP_PARAMS.has(k)) continue;
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  const href = qs ? `/api/admin/export/${entity}?${qs}` : `/api/admin/export/${entity}`;

  return (
    <Link
      href={href}
      prefetch={false}
      className="btn-ghost inline-flex"
      aria-label={label}
    >
      <Download className="h-4 w-4" /> {label}
    </Link>
  );
}
