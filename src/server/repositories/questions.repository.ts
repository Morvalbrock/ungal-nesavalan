import type { ProductQuestion } from "@/types/question";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface QuestionRepository {
  listByProduct(productId: string, opts?: { includeUnpublished?: boolean }): Promise<ProductQuestion[]>;
  listAll(opts?: { onlyPending?: boolean }): Promise<ProductQuestion[]>;
  findById(id: string): Promise<ProductQuestion | null>;
  create(input: {
    productId: string;
    userId: string | null;
    authorName: string;
    body: string;
  }): Promise<ProductQuestion>;
  answer(id: string, input: { body: string; authorName: string }): Promise<ProductQuestion | null>;
  setPublished(id: string, published: boolean): Promise<ProductQuestion | null>;
  remove(id: string): Promise<boolean>;
}

const COLLECTION = "product-questions";

export const jsonQuestionRepo: QuestionRepository = {
  async listByProduct(productId, { includeUnpublished = false } = {}) {
    const rows = await readCollection<ProductQuestion>(COLLECTION);
    return rows
      .filter((q) => q.productId === productId && (includeUnpublished || q.published))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async listAll({ onlyPending = false } = {}) {
    const rows = await readCollection<ProductQuestion>(COLLECTION);
    const filtered = onlyPending ? rows.filter((q) => !q.answer || !q.published) : rows;
    return filtered.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async findById(id) {
    const rows = await readCollection<ProductQuestion>(COLLECTION);
    return rows.find((q) => q.id === id) ?? null;
  },
  async create(input) {
    let created: ProductQuestion | null = null;
    await mutateCollection<ProductQuestion>(COLLECTION, [], (rows) => {
      created = {
        id: newId("qn"),
        productId: input.productId,
        userId: input.userId,
        authorName: input.authorName,
        body: input.body,
        createdAt: nowIso(),
        answer: null,
        published: false
      };
      return [...rows, created];
    });
    return created!;
  },
  async answer(id, input) {
    let updated: ProductQuestion | null = null;
    await mutateCollection<ProductQuestion>(COLLECTION, [], (rows) =>
      rows.map((q) => {
        if (q.id !== id) return q;
        updated = {
          ...q,
          answer: { body: input.body, authorName: input.authorName, answeredAt: nowIso() },
          published: true
        };
        return updated;
      })
    );
    return updated;
  },
  async setPublished(id, published) {
    let updated: ProductQuestion | null = null;
    await mutateCollection<ProductQuestion>(COLLECTION, [], (rows) =>
      rows.map((q) => {
        if (q.id !== id) return q;
        updated = { ...q, published };
        return updated;
      })
    );
    return updated;
  },
  async remove(id) {
    let removed = false;
    await mutateCollection<ProductQuestion>(COLLECTION, [], (rows) => {
      const next = rows.filter((q) => q.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  }
};
