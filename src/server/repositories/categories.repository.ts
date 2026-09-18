import type { Category } from "@/types/category";
import { mutateCollection, newId, readCollection } from "@/server/db/json-store";

export interface CategoryRepository {
  list(): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | null>;
  findById(id: string): Promise<Category | null>;
  create(input: Omit<Category, "id">): Promise<Category>;
  update(id: string, patch: Partial<Category>): Promise<Category | null>;
  remove(id: string): Promise<boolean>;
}

const COLLECTION = "categories";

export const jsonCategoryRepo: CategoryRepository = {
  async list() {
    const rows = await readCollection<Category>(COLLECTION);
    return rows.slice().sort((a, b) => a.sort - b.sort);
  },
  async findBySlug(slug) {
    const rows = await readCollection<Category>(COLLECTION);
    return rows.find((c) => c.slug === slug) ?? null;
  },
  async findById(id) {
    const rows = await readCollection<Category>(COLLECTION);
    return rows.find((c) => c.id === id) ?? null;
  },
  async create(input) {
    const created: Category = { ...input, id: newId("cat") };
    await mutateCollection<Category>(COLLECTION, [], (rows) => [...rows, created]);
    return created;
  },
  async update(id, patch) {
    let updated: Category | null = null;
    await mutateCollection<Category>(COLLECTION, [], (rows) =>
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
    await mutateCollection<Category>(COLLECTION, [], (rows) => {
      const next = rows.filter((c) => c.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  }
};
