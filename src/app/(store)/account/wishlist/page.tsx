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
      <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-10 text-center">
        <p className="font-heritage text-2xl font-bold text-brand-plum">Your Wishlist is Empty</p>
        <p className="mt-2 text-sm text-purple-900/60">Save sarees you love while browsing — they'll wait here for you.</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex font-semibold">
          Explore Handloom Sarees
        </Link>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-heritage text-2xl font-bold text-brand-plum">Saved Handloom Sarees</h2>
        <span className="text-xs font-semibold text-purple-900/60">{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
