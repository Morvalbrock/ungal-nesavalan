import type { PolicyPage } from "@/types/policy";
import { mutateCollection, newId, readCollection } from "@/server/db/json-store";

export interface PolicyRepository {
  list(): Promise<PolicyPage[]>;
  findBySlug(slug: string): Promise<PolicyPage | null>;
  findById(id: string): Promise<PolicyPage | null>;
  upsert(input: Omit<PolicyPage, "id" | "updatedAt"> & { id?: string }): Promise<PolicyPage>;
  remove(id: string): Promise<boolean>;
}

const COLLECTION = "policies";

export const jsonPolicyRepo: PolicyRepository = {
  async list() {
    const rows = await readCollection<PolicyPage>(COLLECTION);
    return rows.slice().sort((a, b) => a.title.localeCompare(b.title));
  },

  async findBySlug(slug: string) {
    const rows = await readCollection<PolicyPage>(COLLECTION);
    const normalized = slug.trim().toLowerCase();
    return rows.find((r) => r.slug.trim().toLowerCase() === normalized) ?? null;
  },

  async findById(id: string) {
    const rows = await readCollection<PolicyPage>(COLLECTION);
    return rows.find((r) => r.id === id) ?? null;
  },

  async upsert(input) {
    let result: PolicyPage | null = null;
    const now = new Date().toISOString();
    const targetSlug = input.slug.trim().toLowerCase();

    await mutateCollection<PolicyPage>(COLLECTION, [], (rows) => {
      const idx = rows.findIndex(
        (r) => (input.id && r.id === input.id) || r.slug.trim().toLowerCase() === targetSlug
      );

      if (idx >= 0) {
        result = {
          ...rows[idx],
          ...input,
          id: rows[idx].id,
          slug: targetSlug,
          updatedAt: now
        };
        const next = rows.slice();
        next[idx] = result;
        return next;
      }

      result = {
        ...input,
        id: input.id || newId("pol"),
        slug: targetSlug,
        updatedAt: now
      };
      return [...rows, result];
    });

    return result!;
  },

  async remove(id: string) {
    let removed = false;
    await mutateCollection<PolicyPage>(COLLECTION, [], (rows) => {
      const next = rows.filter((r) => r.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  }
};
