"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="mx-auto max-w-md text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Something went wrong</p>
        <h1 className="mt-3 font-display text-4xl">We hit a snag</h1>
        <p className="mt-3 text-sm text-ink-muted">
          The page couldn't render. Try again, and if it persists reach out to us.
        </p>
        {error.digest && <p className="mt-3 text-[10px] text-ink-muted">Ref: {error.digest}</p>}
        <button type="button" onClick={reset} className="btn-primary mt-6">
          Try again
        </button>
      </div>
    </div>
  );
}
