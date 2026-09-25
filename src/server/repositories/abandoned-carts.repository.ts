import type { AbandonedCart } from "@/types/abandoned-cart";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface AbandonedCartRepository {
  upsertForUser(input: Omit<AbandonedCart, "id" | "createdAt" | "updatedAt">): Promise<AbandonedCart>;
  markRecovered(userId: string, orderId: string): Promise<void>;
  listActive(): Promise<AbandonedCart[]>;
  remove(id: string): Promise<boolean>;
}

const COLLECTION = "abandoned-carts";

export const jsonAbandonedCartRepo: AbandonedCartRepository = {
  async upsertForUser(input) {
    let result: AbandonedCart | null = null;
    await mutateCollection<AbandonedCart>(COLLECTION, [], (rows) => {
      const now = nowIso();
      const idx = rows.findIndex((c) => c.userId === input.userId && !c.recoveredOrderId);
      if (idx === -1) {
        result = { ...input, id: newId("abc"), createdAt: now, updatedAt: now };
        return [...rows, result];
      }
      const existing = rows[idx];
      result = { ...existing, ...input, updatedAt: now };
      const next = rows.slice();
      next[idx] = result;
      return next;
    });
    return result!;
  },
  async markRecovered(userId, orderId) {
    await mutateCollection<AbandonedCart>(COLLECTION, [], (rows) =>
      rows.map((c) =>
        c.userId === userId && !c.recoveredOrderId
          ? { ...c, recoveredOrderId: orderId, updatedAt: nowIso() }
          : c
      )
    );
  },
  async listActive() {
    const rows = await readCollection<AbandonedCart>(COLLECTION);
    return rows
      .filter((c) => !c.recoveredOrderId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async remove(id) {
    let removed = false;
    await mutateCollection<AbandonedCart>(COLLECTION, [], (rows) => {
      const before = rows.length;
      const next = rows.filter((c) => c.id !== id);
      removed = next.length < before;
      return next;
    });
    return removed;
  }
};
