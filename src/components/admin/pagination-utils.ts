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

export function buildHref(
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
