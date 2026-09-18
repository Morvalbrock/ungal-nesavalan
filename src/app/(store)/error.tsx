"use client";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";

export default function StoreError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl">We couldn't load this page</h1>
      <p className="mt-3 text-sm text-ink-muted">Give it another try. If it keeps happening, refresh and let us know.</p>
      {error.digest && <p className="mt-3 text-[10px] text-ink-muted">Ref: {error.digest}</p>}
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </Container>
  );
}
