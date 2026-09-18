import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function StoreNotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-display text-6xl text-ink-muted">404</p>
      <h1 className="mt-4 font-display text-3xl">This saree seems to have shipped elsewhere</h1>
      <p className="mt-3 text-sm text-ink-muted">
        The page you're looking for isn't here. Browse the collection instead.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/products" className="btn-primary">Browse sarees</Link>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </Container>
  );
}
