import Link from "next/link";
import { Container } from "@/components/layout/Container";

export function AuthShell({
  title,
  tagline,
  footer,
  children
}: {
  title: string;
  tagline?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">
          ← Continue browsing
        </Link>
        <h1 className="mt-4 font-display text-4xl">{title}</h1>
        {tagline && <p className="mt-2 text-sm text-ink-muted">{tagline}</p>}
        <div className="mt-8">{children}</div>
        {footer && <p className="mt-6 text-xs text-ink-muted">{footer}</p>}
      </div>
    </Container>
  );
}

export function AuthField({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-maroon">{error}</span>}
    </label>
  );
}

export const authInputCls =
  "w-full rounded-card border border-border bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-ink";
