export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="flex items-center gap-2 text-ink-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-muted" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-muted [animation-delay:120ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-muted [animation-delay:240ms]" />
      </div>
    </div>
  );
}
