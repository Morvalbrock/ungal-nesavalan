import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { readCollection } from "@/server/db/json-store";
import type { Product } from "@/types/product";
import { categoryRepo } from "@/server/repositories";
import { getSession } from "@/features/auth/session";
import { formatINR } from "@/lib/utils";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { Pagination, resolvePage, resolvePerPage } from "@/components/admin/Pagination";
import { SortableHeader, parseSort } from "@/components/admin/SortableHeader";
import {
  BulkCheckbox,
  BulkSelectAllCheckbox,
  BulkSelectInit
} from "@/components/admin/BulkSelect";
import { ProductBulkActions } from "@/components/admin/ProductBulkActions";
import { ExportLink } from "@/components/admin/ExportLink";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  category?: string;
  status?: string;
  featured?: string;
  sort?: string;
  page?: string;
  perPage?: string;
}

const PATHNAME = "/admin/products";

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [products, categories, session] = await Promise.all([
    readCollection<Product>("products"),
    categoryRepo.list(),
    getSession()
  ]);
  const sp = await searchParams;
  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Filter
  const needle = sp.q?.trim().toLowerCase() ?? "";
  const filtered = products.filter((p) => {
    if (needle) {
      const hay = `${p.name} ${p.description} ${p.weave} ${p.fabric}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (sp.category && sp.category !== "all" && p.categoryId !== sp.category) return false;
    if (sp.status === "live" && !p.published) return false;
    if (sp.status === "draft" && p.published) return false;
    if (sp.featured === "yes" && !p.featured) return false;
    if (sp.featured === "no" && p.featured) return false;
    return true;
  });

  // Sort
  const sort = parseSort(sp.sort, "updated", "desc");
  const sorted = filtered.slice().sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    switch (sort.field) {
      case "name":
        return a.name.localeCompare(b.name) * dir;
      case "price":
        return ((a.salePrice ?? a.basePrice) - (b.salePrice ?? b.basePrice)) * dir;
      case "stock": {
        const as = a.variants.reduce((n, v) => n + v.stock, 0);
        const bs = b.variants.reduce((n, v) => n + v.stock, 0);
        return (as - bs) * dir;
      }
      case "updated":
      default:
        return a.updatedAt.localeCompare(b.updatedAt) * dir;
    }
  });

  // Paginate
  const perPage = resolvePerPage(sp.perPage);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const page = resolvePage(sp.page, totalPages);
  const pageSlice = sorted.slice((page - 1) * perPage, page * perPage);
  const pageIds = pageSlice.map((p) => p.id);

  // Counts for filter chips
  const liveCount = products.filter((p) => p.published).length;
  const draftCount = products.length - liveCount;
  const featuredCount = products.filter((p) => p.featured).length;

  const isSuperAdmin = session?.role === "super_admin";

  const serializedSp: Record<string, string | undefined> = {
    q: sp.q,
    category: sp.category,
    status: sp.status,
    featured: sp.featured,
    sort: sp.sort,
    page: sp.page,
    perPage: sp.perPage
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Catalog</p>
          <h1 className="mt-2 font-display text-3xl">
            Products
            <span className="ml-3 text-sm font-normal text-ink-muted">
              {sorted.length} of {products.length}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ExportLink entity="products" />
          <Link href="/admin/products/new" className="btn-primary inline-flex">
            <Plus className="h-4 w-4" /> New product
          </Link>
        </div>
      </header>

      <SearchFilter
        searchPlaceholder="Search by name, weave, fabric…"
        filters={[
          {
            key: "category",
            label: "Category",
            options: categories.map((c) => ({ value: c.id, label: c.name }))
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "live", label: "Live", count: liveCount },
              { value: "draft", label: "Draft", count: draftCount }
            ]
          },
          {
            key: "featured",
            label: "Featured",
            options: [
              { value: "yes", label: "Featured", count: featuredCount },
              { value: "no", label: "Not featured" }
            ]
          }
        ]}
      />

      <BulkSelectInit ids={pageIds} />

      <div className="overflow-hidden rounded-card border border-border bg-cream">
        <table className="w-full text-sm">
          <thead className="bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="w-10 p-3">
                <BulkSelectAllCheckbox />
              </th>
              <SortableHeader field="name" label="Product" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <th className="p-3">Category</th>
              <SortableHeader field="price" label="Price" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <SortableHeader field="stock" label="Stock" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <th className="p-3">Status</th>
              <SortableHeader field="updated" label="Updated" current={sort} pathname={PATHNAME} searchParams={serializedSp} />
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((p) => {
              const totalStock = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="border-t border-border/70">
                  <td className="p-3">
                    <BulkCheckbox id={p.id} />
                  </td>
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
                  <td className="p-3 text-xs text-ink-muted">
                    {new Date(p.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                  <td className="p-3 text-right">
                    <ProductRowActions
                      productId={p.id}
                      productName={p.name}
                      published={p.published}
                      featured={p.featured}
                    />
                  </td>
                </tr>
              );
            })}
            {pageSlice.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-ink-muted">
                  {products.length === 0 ? (
                    <>
                      No products yet. <Link href="/admin/products/new" className="link-underline">Create the first one</Link>.
                    </>
                  ) : (
                    <>No products match your filters. <Link href="/admin/products" className="link-underline">Clear filters</Link>.</>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        perPage={perPage}
        total={sorted.length}
        pathname={PATHNAME}
        searchParams={serializedSp}
      />

      <ProductBulkActions canDelete={isSuperAdmin} />
    </div>
  );
}
