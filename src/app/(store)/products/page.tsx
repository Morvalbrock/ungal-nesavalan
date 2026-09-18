import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { productRepo } from "@/server/repositories";

export const metadata = { title: "All Sarees" };

export default async function ProductsPage() {
  const { items, total } = await productRepo.list({ perPage: 60 });
  return (
    <Container className="py-14">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Collection</p>
          <h1 className="mt-2 font-display text-4xl">All Sarees</h1>
        </div>
        <p className="text-sm text-ink-muted">{total} pieces</p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </Container>
  );
}
