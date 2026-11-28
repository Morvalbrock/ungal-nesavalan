"use client";

import { useRouter } from "next/navigation";
import { useTransition, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminListLoadingStore } from "@/features/admin/list-loading.store";
import { buildHref } from "./pagination-utils";

export {
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
  resolvePage,
  resolvePerPage
} from "./pagination-utils";

export interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  pathname: string;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({ page, perPage, total, pathname, searchParams }: PaginationProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const startLoading = useAdminListLoadingStore((s) => s.startLoading);
  const stopLoading = useAdminListLoadingStore((s) => s.stopLoading);

  useEffect(() => {
    if (!pending) stopLoading();
  }, [pending, stopLoading]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1 && total <= perPage) return null;

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  const prevHref =
    page > 1 ? buildHref(pathname, searchParams, { page: String(page - 1) }) : null;
  const nextHref =
    page < totalPages ? buildHref(pathname, searchParams, { page: String(page + 1) }) : null;

  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pageNumbers: number[] = [];
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  function navigate(href: string, targetPage: number) {
    startLoading(`page:${targetPage}`);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
      <span>
        Showing <strong className="text-ink">{from}</strong>–<strong className="text-ink">{to}</strong> of{" "}
        <strong className="text-ink">{total}</strong>
      </span>

      <div className="flex items-center gap-1">
        <PageLink href={prevHref} label="Previous" onNavigate={(h) => navigate(h, page - 1)}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </PageLink>

        {start > 1 && (
          <>
            <PageLink
              href={buildHref(pathname, searchParams, { page: "1" })}
              label="Page 1"
              onNavigate={(h) => navigate(h, 1)}
            >
              1
            </PageLink>
            {start > 2 && <span className="px-1">…</span>}
          </>
        )}

        {pageNumbers.map((n) => (
          <PageLink
            key={n}
            href={buildHref(pathname, searchParams, { page: String(n) })}
            label={`Page ${n}`}
            active={n === page}
            onNavigate={(h) => navigate(h, n)}
          >
            {n}
          </PageLink>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1">…</span>}
            <PageLink
              href={buildHref(pathname, searchParams, { page: String(totalPages) })}
              label={`Page ${totalPages}`}
              onNavigate={(h) => navigate(h, totalPages)}
            >
              {totalPages}
            </PageLink>
          </>
        )}

        <PageLink href={nextHref} label="Next" onNavigate={(h) => navigate(h, page + 1)}>
          <ChevronRight className="h-3.5 w-3.5" />
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  label,
  active,
  children,
  onNavigate
}: {
  href: string | null;
  label: string;
  active?: boolean;
  children: React.ReactNode;
  onNavigate: (href: string) => void;
}) {
  const base =
    "inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-card border px-2 text-xs transition-colors";
  if (!href) {
    return (
      <span className={`${base} cursor-not-allowed border-border/50 text-ink-muted/50`} aria-label={label}>
        {children}
      </span>
    );
  }
  if (active) {
    return (
      <span className={`${base} border-ink bg-ink text-cream`} aria-current="page" aria-label={label}>
        {children}
      </span>
    );
  }
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(href!);
  }
  return (
    <a
      href={href}
      onClick={onClick}
      className={`${base} border-border text-ink hover:border-ink`}
      aria-label={label}
    >
      {children}
    </a>
  );
}
