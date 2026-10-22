import type { JournalPost } from "@/types/post";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface PostRepository {
  list(opts?: { includeDrafts?: boolean }): Promise<JournalPost[]>;
  findById(id: string): Promise<JournalPost | null>;
  findBySlug(slug: string, opts?: { includeDrafts?: boolean }): Promise<JournalPost | null>;
  create(input: Omit<JournalPost, "id" | "createdAt" | "updatedAt">): Promise<JournalPost>;
  update(id: string, patch: Partial<JournalPost>): Promise<JournalPost | null>;
  remove(id: string): Promise<boolean>;
}

const COLLECTION = "posts";

function sortNewest(a: JournalPost, b: JournalPost): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

export const jsonPostRepo: PostRepository = {
  async list({ includeDrafts = false } = {}) {
    const rows = await readCollection<JournalPost>(COLLECTION);
    const filtered = includeDrafts ? rows : rows.filter((p) => !p.draft);
    return filtered.slice().sort(sortNewest);
  },
  async findById(id) {
    const rows = await readCollection<JournalPost>(COLLECTION);
    return rows.find((p) => p.id === id) ?? null;
  },
  async findBySlug(slug, { includeDrafts = false } = {}) {
    const rows = await readCollection<JournalPost>(COLLECTION);
    return rows.find((p) => p.slug === slug && (includeDrafts || !p.draft)) ?? null;
  },
  async create(input) {
    const created: JournalPost = {
      ...input,
      id: newId("post"),
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    await mutateCollection<JournalPost>(COLLECTION, [], (rows) => [...rows, created]);
    return created;
  },
  async update(id, patch) {
    let updated: JournalPost | null = null;
    await mutateCollection<JournalPost>(COLLECTION, [], (rows) =>
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
    await mutateCollection<JournalPost>(COLLECTION, [], (rows) => {
      const next = rows.filter((p) => p.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  }
};
