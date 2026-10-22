import type { Product, ProductQuery, ProductSummary } from "@/types/product";
import type { Category } from "@/types/category";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface AvailableFacetItem {
  id: string;
  label: string;
  count: number;
}

export interface AvailableFacets {
  categories: AvailableFacetItem[];
  weaves: AvailableFacetItem[];
  fabrics: AvailableFacetItem[];
  occasions: AvailableFacetItem[];
}

export interface CraftCluster {
  weave: string;
  place: string;
  href: string;
}

export const ALL_CRAFT_CLUSTERS: CraftCluster[] = [
  { weave: "Kanchivaram", place: "Kanchipuram, TN", href: "/products?weave=kanchivaram" },
  { weave: "Aarani", place: "Aarani, TN", href: "/products?weave=aarani" },
  { weave: "Elampillai", place: "Elampillai, Salem", href: "/products?weave=elampillai" },
  { weave: "Banarasi", place: "Varanasi, UP", href: "/products?weave=banarasi" },
  { weave: "Chanderi", place: "Chanderi, MP", href: "/products?weave=chanderi" },
  { weave: "Patola", place: "Patan, Gujarat", href: "/products?weave=patola" },
  { weave: "Jamdani", place: "Uppada, AP", href: "/products?weave=jamdani" },
  { weave: "Ikat", place: "Pochampally / Sambalpur", href: "/products?weave=ikat" },
  { weave: "Paithani", place: "Paithan, Maharashtra", href: "/products?weave=paithani" },
  { weave: "Bandhani", place: "Kutch, Gujarat", href: "/products?weave=bandhani" },
  { weave: "Muga", place: "Sualkuchi, Assam", href: "/products?q=muga" },
  { weave: "Baluchari", place: "Bishnupur, WB", href: "/products?q=baluchari" }
];

export interface ProductRepository {
  list(query?: ProductQuery): Promise<{ items: ProductSummary[]; total: number }>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  featured(limit?: number): Promise<ProductSummary[]>;
  getAvailableFacets(): Promise<AvailableFacets>;
  create(input: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  update(id: string, patch: Partial<Product>): Promise<Product | null>;
  remove(id: string): Promise<boolean>;
  adjustStock(entries: { productId: string; variantId: string; delta: number }[]): Promise<void>;
}

const COLLECTION = "products";

export function hasStock(p: Product): boolean {
  return Array.isArray(p.variants) && p.variants.some((v) => (Number(v.stock) || 0) > 0);
}

export async function getInStockCraftClusters(): Promise<CraftCluster[]> {
  const rows = await readCollection<Product>(COLLECTION);
  const inStock = rows.filter((p) => p.published && hasStock(p));
  return ALL_CRAFT_CLUSTERS.filter((c) => {
    const w = c.weave.toLowerCase();
    return inStock.some(
      (p) =>
        (p.weave && p.weave.toLowerCase() === w) ||
        (p.name && p.name.toLowerCase().includes(w))
    );
  });
}

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
  let out = rows.filter((p) => p.published && (q.includeOutOfStock ? true : hasStock(p)));
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
      .filter((p) => p.published && p.featured && hasStock(p))
      .slice(0, limit)
      .map(toSummary);
  },
  async getAvailableFacets() {
    const rows = await readCollection<Product>(COLLECTION);
    const inStock = rows.filter((p) => p.published && hasStock(p));

    const catMap = new Map<string, number>();
    const weaveMap = new Map<string, number>();
    const fabricMap = new Map<string, number>();
    const occasionMap = new Map<string, number>();

    for (const p of inStock) {
      if (p.categoryId) catMap.set(p.categoryId, (catMap.get(p.categoryId) ?? 0) + 1);
      if (p.weave) weaveMap.set(p.weave, (weaveMap.get(p.weave) ?? 0) + 1);
      if (p.fabric) fabricMap.set(p.fabric, (fabricMap.get(p.fabric) ?? 0) + 1);
      if (Array.isArray(p.occasion)) {
        for (const o of p.occasion) {
          occasionMap.set(o, (occasionMap.get(o) ?? 0) + 1);
        }
      }
    }

    const categoriesRepo = await readCollection<Category>("categories");
    const categories: AvailableFacetItem[] = categoriesRepo
      .filter((c) => catMap.has(c.id))
      .map((c) => ({ id: c.id, label: c.name, count: catMap.get(c.id)! }))
      .sort((a, b) => b.count - a.count);

    const weaves: AvailableFacetItem[] = Array.from(weaveMap.entries()).map(([k, count]) => ({
      id: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      count
    }));

    const fabrics: AvailableFacetItem[] = Array.from(fabricMap.entries()).map(([k, count]) => ({
      id: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      count
    }));

    const occasions: AvailableFacetItem[] = Array.from(occasionMap.entries()).map(([k, count]) => ({
      id: k,
      label: k.charAt(0).toUpperCase() + k.slice(1),
      count
    }));

    return { categories, weaves, fabrics, occasions };
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
