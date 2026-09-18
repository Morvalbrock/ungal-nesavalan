import type { Product, ProductQuery, ProductSummary } from "@/types/product";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface ProductRepository {
  list(query?: ProductQuery): Promise<{ items: ProductSummary[]; total: number }>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  featured(limit?: number): Promise<ProductSummary[]>;
  create(input: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  update(id: string, patch: Partial<Product>): Promise<Product | null>;
  remove(id: string): Promise<boolean>;
  adjustStock(entries: { productId: string; variantId: string; delta: number }[]): Promise<void>;
}

const COLLECTION = "products";

function toSummary(p: Product): ProductSummary {
  return {
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
  };
}

function applyQuery(rows: Product[], q: ProductQuery = {}): Product[] {
  let out = rows.filter((p) => p.published);
  if (q.q) {
    const needle = q.q.toLowerCase();
    out = out.filter(
      (p) => p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle)
    );
  }
  if (q.category) out = out.filter((p) => p.categoryId === q.category);
  if (q.fabric?.length) out = out.filter((p) => q.fabric!.includes(p.fabric));
  if (q.weave?.length) out = out.filter((p) => q.weave!.includes(p.weave));
  if (q.occasion?.length) out = out.filter((p) => p.occasion.some((o) => q.occasion!.includes(o)));
  if (q.minPrice != null) out = out.filter((p) => (p.salePrice ?? p.basePrice) >= q.minPrice!);
  if (q.maxPrice != null) out = out.filter((p) => (p.salePrice ?? p.basePrice) <= q.maxPrice!);
  switch (q.sort) {
    case "price-asc":
      out.sort((a, b) => (a.salePrice ?? a.basePrice) - (b.salePrice ?? b.basePrice));
      break;
    case "price-desc":
      out.sort((a, b) => (b.salePrice ?? b.basePrice) - (a.salePrice ?? a.basePrice));
      break;
    case "featured":
      out.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
    case "newest":
    default:
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return out;
}

export const jsonProductRepo: ProductRepository = {
  async list(query = {}) {
    const rows = await readCollection<Product>(COLLECTION);
    const filtered = applyQuery(rows, query);
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.min(60, Math.max(1, query.perPage ?? 24));
    const start = (page - 1) * perPage;
    const items = filtered.slice(start, start + perPage).map(toSummary);
    return { items, total: filtered.length };
  },
  async findBySlug(slug) {
    const rows = await readCollection<Product>(COLLECTION);
    return rows.find((p) => p.slug === slug && p.published) ?? null;
  },
  async findById(id) {
    const rows = await readCollection<Product>(COLLECTION);
    return rows.find((p) => p.id === id) ?? null;
  },
  async featured(limit = 8) {
    const rows = await readCollection<Product>(COLLECTION);
    return rows
      .filter((p) => p.published && p.featured)
      .slice(0, limit)
      .map(toSummary);
  },
  async create(input) {
    const created: Product = { ...input, id: newId("prd"), createdAt: nowIso(), updatedAt: nowIso() };
    await mutateCollection<Product>(COLLECTION, [], (rows) => [...rows, created]);
    return created;
  },
  async update(id, patch) {
    let updated: Product | null = null;
    await mutateCollection<Product>(COLLECTION, [], (rows) =>
      rows.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch, id: p.id, updatedAt: nowIso() };
        return updated;
      })
    );
    return updated;
  },
  async remove(id) {
    let removed = false;
    await mutateCollection<Product>(COLLECTION, [], (rows) => {
      const next = rows.filter((p) => p.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  },
  async adjustStock(entries) {
    await mutateCollection<Product>(COLLECTION, [], (rows) =>
      rows.map((p) => {
        const affecting = entries.filter((e) => e.productId === p.id);
        if (affecting.length === 0) return p;
        return {
          ...p,
          updatedAt: nowIso(),
          variants: p.variants.map((v) => {
            const hit = affecting.find((e) => e.variantId === v.id);
            if (!hit) return v;
            return { ...v, stock: Math.max(0, v.stock + hit.delta) };
          })
        };
      })
    );
  }
};
