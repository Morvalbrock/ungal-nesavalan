import Link from "next/link";
import { readCollection } from "@/server/db/json-store";
import type { Product } from "@/types/product";
import { catalogRepo } from "@/server/repositories";
import { ProductReorderList, type ReorderableProduct } from "@/components/admin/ProductReorderList";

export const dynamic = "force-dynamic";

interface SearchParams {
  catalog?: string;
}

export default async function AdminProductsReorderPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [products, catalogs, sp] = await Promise.all([
    readCollection<Product>("products"),
    catalogRepo.list(),
    searchParams
  ]);

  const activeCatalogSlug = sp.catalog ?? "";
  const activeCatalog = catalogs.find((c) => c.slug === activeCatalogSlug);

  // Pre-compute how many products live in each catalog so the chips can show a count
  // and admins can tell at a glance whether the filter is actually narrowing the list.
  const countsByCatalog = new Map<string, number>();
  for (const p of products) {
    if (!p.weave) continue;
    countsByCatalog.set(p.weave, (countsByCatalog.get(p.weave) ?? 0) + 1);
  }

  // Products in the chosen catalog, sorted by the same admin-set order the customer sees.
  const inCatalog = activeCatalogSlug
    ? products
        .filter((p) => p.weave === activeCatalogSlug)
        .sort((a, b) => {
          const sa = a.sort ?? Number.MAX_SAFE_INTEGER;
          const sb = b.sort ?? Number.MAX_SAFE_INTEGER;
          if (sa !== sb) return sa - sb;
          return b.createdAt.localeCompare(a.createdAt);
        })
    : [];

  const items: ReorderableProduct[] = inCatalog.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.images[0]?.url,
    priceDisplayPaise: p.salePrice ?? p.basePrice,
    published: p.published
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <Link href="/admin/products" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
            ← Products
          </Link>
          <h1 className="mt-2 font-display text-3xl">Customer Display Order</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Pick a catalog (weave), then drag products to decide which one customers see first.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-cream p-4">
        <span className="text-xs uppercase tracking-widest text-ink-muted">Catalog:</span>
        {catalogs.map((c) => {
          const active = c.slug === activeCatalogSlug;
          const count = countsByCatalog.get(c.slug) ?? 0;
          const empty = count === 0;
          return (
            <Link
              key={c.id}
              href={`/admin/products/reorder?catalog=${c.slug}`}
              aria-disabled={empty}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-ink bg-ink text-cream"
                  : empty
                    ? "border-border/60 text-ink-muted/50 pointer-events-none"
                    : "border-border text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {c.name} · {count}
              {c.legacy && <span className="ml-1 text-ink-muted/60">(legacy)</span>}
            </Link>
          );
        })}
      </div>

      {activeCatalog && (
        <p className="text-xs text-ink-muted">
          Showing <span className="font-medium text-ink">{inCatalog.length}</span>{" "}
          {inCatalog.length === 1 ? "product" : "products"} in{" "}
          <span className="font-medium text-ink">{activeCatalog.name}</span>.
        </p>
      )}

      {activeCatalog ? (
        <ProductReorderList
          catalogSlug={activeCatalog.slug}
          catalogName={activeCatalog.name}
          initialProducts={items}
        />
      ) : (
        <p className="rounded-card border border-border bg-cream p-6 text-sm text-ink-muted">
          Pick a catalog above to start ordering its products.
        </p>
      )}
    </div>
  );
}
