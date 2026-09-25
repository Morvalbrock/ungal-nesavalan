import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";
import { productRepo, wishlistRepo } from "@/server/repositories";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductSummary } from "@/types/product";

export const metadata: Metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/wishlist");

  const rows = await wishlistRepo.listByUser(session.userId);
  const products = await Promise.all(rows.map((r) => productRepo.findById(r.productId)));
  const items: ProductSummary[] = products
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      basePrice: p.basePrice,
      salePrice: p.salePrice,
      fabric: p.fabric,
      weave: p.weave,
      occasion: p.occasion,
      images: p.images,
      categoryId: p.categoryId,
      featured: p.featured
    }));

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-border bg-cream-warm p-10 text-center">
        <p className="font-display text-2xl">Your wishlist is empty</p>
        <p className="mt-2 text-sm text-ink-muted">Save sarees you love — they'll wait here for you.</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">
          Browse sarees
        </Link>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl">Saved sarees</h2>
        <span className="text-sm text-ink-muted">{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
