import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  pathname: string;
  searchParams: Record<string, string | undefined>;
}

export const DEFAULT_PER_PAGE = 25;
export const MAX_PER_PAGE = 100;

export function resolvePage(raw: string | undefined, totalPages: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > totalPages && totalPages > 0) return totalPages;
  return Math.floor(n);
}

export function resolvePerPage(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PER_PAGE;
  return Math.min(MAX_PER_PAGE, Math.floor(n));
}

function buildHref(
  pathname: string,
  searchParams: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v != null && v !== "") params.set(k, v);
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v == null || v === "") params.delete(k);
    else params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function Pagination({ page, perPage, total, pathname, searchParams }: PaginationProps) {
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
      <span>
        Showing <strong className="text-ink">{from}</strong>–<strong className="text-ink">{to}</strong> of{" "}
        <strong className="text-ink">{total}</strong>
      </span>

      <div className="flex items-center gap-1">
        <PageLink href={prevHref} label="Previous">
          <ChevronLeft className="h-3.5 w-3.5" />
        </PageLink>

        {start > 1 && (
          <>
            <PageLink
              href={buildHref(pathname, searchParams, { page: "1" })}
              label="Page 1"
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
            >
              {totalPages}
            </PageLink>
          </>
        )}

        <PageLink href={nextHref} label="Next">
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
  children
}: {
  href: string | null;
  label: string;
  active?: boolean;
  children: React.ReactNode;
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
  return (
    <Link
      href={href}
      scroll={false}
      className={`${base} border-border text-ink hover:border-ink`}
      aria-label={label}
    >
      {children}
    </Link>
  );
}
