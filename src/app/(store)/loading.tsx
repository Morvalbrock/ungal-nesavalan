import { Container } from "@/components/layout/Container";

export default function StoreLoading() {
  return (
    <Container className="py-16">
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-ink/5" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] animate-pulse rounded-card bg-ink/5" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-ink/5" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-ink/5" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
