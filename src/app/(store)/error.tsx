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
    <div className="bg-[#faf7fd] min-h-[70vh] flex items-center justify-center">
      <Container className="py-20 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 tracking-wide uppercase">
          Temporary Loom Disruption
        </span>
        <h1 className="mt-4 font-heritage text-3xl sm:text-4xl font-bold text-brand-plum">We Couldn&apos;t Load This Page</h1>
        <p className="mt-3 text-sm text-purple-900/70 max-w-md mx-auto">
          Please give it another try. If it keeps happening, please refresh or contact our care team.
        </p>
        {error.digest && <p className="mt-3 text-[10px] text-purple-900/50">Ref: {error.digest}</p>}
        <button type="button" onClick={reset} className="btn-primary mt-6 font-semibold">
          Try Again
        </button>
      </Container>
    </div>
  );
}
