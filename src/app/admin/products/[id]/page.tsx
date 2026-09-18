import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { categoryRepo, productRepo } from "@/server/repositories";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    productRepo.findById(id),
    categoryRepo.list()
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/products" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
          ← Products
        </Link>
        <div className="mt-2 flex items-baseline justify-between">
          <h1 className="font-display text-3xl">Edit product</h1>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="text-xs text-ink-muted hover:text-ink"
          >
            View on storefront ↗
          </Link>
        </div>
      </header>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
