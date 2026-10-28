import type { Catalog } from "@/types/catalog";
import { mutateCollection, newId, readCollection } from "@/server/db/json-store";

export interface CatalogRepository {
  list(): Promise<Catalog[]>;
  findBySlug(slug: string): Promise<Catalog | null>;
  findById(id: string): Promise<Catalog | null>;
  create(input: Omit<Catalog, "id">): Promise<Catalog>;
  update(id: string, patch: Partial<Catalog>): Promise<Catalog | null>;
  remove(id: string): Promise<boolean>;
}

const COLLECTION = "catalogs";

export const jsonCatalogRepo: CatalogRepository = {
  async list() {
    const rows = await readCollection<Catalog>(COLLECTION);
    return rows.slice().sort((a, b) => {
      // Non-legacy entries first, then by sort order, then alpha.
      if (!!a.legacy !== !!b.legacy) return a.legacy ? 1 : -1;
      if (a.sort !== b.sort) return a.sort - b.sort;
      return a.name.localeCompare(b.name);
    });
  },
  async findBySlug(slug) {
    const rows = await readCollection<Catalog>(COLLECTION);
    return rows.find((c) => c.slug === slug) ?? null;
  },
  async findById(id) {
    const rows = await readCollection<Catalog>(COLLECTION);
    return rows.find((c) => c.id === id) ?? null;
  },
  async create(input) {
    const created: Catalog = { ...input, id: newId("ctl") };
    await mutateCollection<Catalog>(COLLECTION, [], (rows) => [...rows, created]);
    return created;
  },
  async update(id, patch) {
    let updated: Catalog | null = null;
    await mutateCollection<Catalog>(COLLECTION, [], (rows) =>
      rows.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...patch, id: c.id };
        return updated;
      })
    );
    return updated;
  },
  async remove(id) {
    let removed = false;
    await mutateCollection<Catalog>(COLLECTION, [], (rows) => {
      const next = rows.filter((c) => c.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  }
};
