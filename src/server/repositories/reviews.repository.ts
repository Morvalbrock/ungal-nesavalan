import type { Review, ReviewAggregate } from "@/types/review";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface ReviewRepository {
  listByProduct(productId: string, opts?: { page?: number; perPage?: number }): Promise<{ items: Review[]; total: number }>;
  findByUserAndProduct(userId: string, productId: string): Promise<Review | null>;
  create(input: Omit<Review, "id" | "createdAt" | "verified">): Promise<Review>;
  aggregateFor(productId: string): Promise<ReviewAggregate>;
  aggregateForMany(productIds: string[]): Promise<Record<string, ReviewAggregate>>;
}

const COLLECTION = "reviews";
const EMPTY_DISTRIBUTION: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

function aggregate(productId: string, rows: Review[]): ReviewAggregate {
  const filtered = rows.filter((r) => r.productId === productId);
  if (filtered.length === 0) return { productId, avg: 0, count: 0, distribution: { ...EMPTY_DISTRIBUTION } };
  const dist = { ...EMPTY_DISTRIBUTION };
  let sum = 0;
  for (const r of filtered) {
    dist[r.rating] += 1;
    sum += r.rating;
  }
  return { productId, avg: sum / filtered.length, count: filtered.length, distribution: dist };
}

export const jsonReviewRepo: ReviewRepository = {
  async listByProduct(productId, { page = 1, perPage = 10 } = {}) {
    const rows = await readCollection<Review>(COLLECTION);
    const all = rows
      .filter((r) => r.productId === productId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * perPage;
    return { items: all.slice(start, start + perPage), total: all.length };
  },
  async findByUserAndProduct(userId, productId) {
    const rows = await readCollection<Review>(COLLECTION);
    return rows.find((r) => r.userId === userId && r.productId === productId) ?? null;
  },
  async create(input) {
    let created: Review | null = null;
    await mutateCollection<Review>(COLLECTION, [], (rows) => {
      const existing = rows.find((r) => r.userId === input.userId && r.productId === input.productId);
      if (existing) {
        created = existing;
        return rows;
      }
      created = { ...input, id: newId("rvw"), verified: true, createdAt: nowIso() };
      return [...rows, created];
    });
    return created!;
  },
  async aggregateFor(productId) {
    const rows = await readCollection<Review>(COLLECTION);
    return aggregate(productId, rows);
  },
  async aggregateForMany(productIds) {
    const rows = await readCollection<Review>(COLLECTION);
    const out: Record<string, ReviewAggregate> = {};
    for (const pid of productIds) out[pid] = aggregate(pid, rows);
    return out;
  }
};
