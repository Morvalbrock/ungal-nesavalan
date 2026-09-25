import type { CartItem } from "@/features/cart/cart.types";
import { mutateCollection, readCollection } from "@/server/db/json-store";

export interface UserCart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface CartRepository {
  get(userId: string): Promise<UserCart | null>;
  save(userId: string, items: CartItem[]): Promise<UserCart>;
  clear(userId: string): Promise<void>;
}

const COLLECTION = "carts";

export const jsonCartRepo: CartRepository = {
  async get(userId) {
    const rows = await readCollection<UserCart>(COLLECTION);
    return rows.find((c) => c.userId === userId) ?? null;
  },
  async save(userId, items) {
    let saved: UserCart | null = null;
    await mutateCollection<UserCart>(COLLECTION, [], (rows) => {
      saved = { userId, items, updatedAt: new Date().toISOString() };
      const idx = rows.findIndex((c) => c.userId === userId);
      if (idx === -1) return [...rows, saved];
      const next = rows.slice();
      next[idx] = saved;
      return next;
    });
    return saved!;
  },
  async clear(userId) {
    await mutateCollection<UserCart>(COLLECTION, [], (rows) =>
      rows.filter((c) => c.userId !== userId)
    );
  }
};
