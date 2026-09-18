import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { readCollection } from "@/server/db/json-store";
import type { Product } from "@/types/product";
import { categoryRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    readCollection<Product>("products"),
    categoryRepo.list()
  ]);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const sorted = products.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Catalog</p>
          <h1 className="mt-2 font-display text-3xl">Products</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary inline-flex">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </header>

      <div className="overflow-hidden rounded-card border border-border bg-cream">
        <table className="w-full text-sm">
          <thead className="bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const totalStock = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="border-t border-border/70">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] && (
                        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-cream-warm">
                          <Image src={p.images[0].url} alt={p.images[0].alt} fill sizes="60px" className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-ink-muted">
                          {p.weave} · {p.fabric}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{catMap.get(p.categoryId)?.name ?? "—"}</td>
                  <td className="p-3">
                    {formatINR(p.salePrice ?? p.basePrice)}
                    {p.salePrice != null && (
                      <span className="ml-1 text-xs text-ink-muted line-through">{formatINR(p.basePrice)}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {totalStock === 0 ? (
                      <span className="text-maroon">Sold out</span>
                    ) : totalStock <= 3 ? (
                      <span className="text-gold">{totalStock} left</span>
                    ) : (
                      totalStock
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {p.published ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-700">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] uppercase tracking-widest">
                          Draft
                        </span>
                      )}
                      {p.featured && (
                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-xs text-ink-muted hover:text-ink"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-ink-muted">
                  No products yet. <Link href="/admin/products/new" className="link-underline">Create the first one</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
