import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function StoreNotFound() {
  return (
    <div className="bg-[#faf7fd] min-h-[70vh] flex items-center justify-center">
      <Container className="py-20 text-center">
        <p className="font-heritage text-7xl font-bold text-brand-purple/40">404</p>
        <h1 className="mt-4 font-heritage text-3xl sm:text-4xl font-bold text-brand-plum">This Saree Seems to Have Shipped Elsewhere</h1>
        <p className="mt-3 text-sm text-purple-900/70 max-w-md mx-auto">
          The page or handloom piece you&apos;re looking for isn&apos;t here. Explore our authentic Elampillai collection instead.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/products" className="btn-primary font-semibold">Browse Handloom Sarees</Link>
          <Link href="/" className="btn-ghost font-semibold">Return Home</Link>
        </div>
      </Container>
    </div>
  );
}
