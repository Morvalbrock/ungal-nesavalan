import type { Wishlist } from "@/types/wishlist";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface WishlistRepository {
  listByUser(userId: string): Promise<Wishlist[]>;
  add(userId: string, productId: string): Promise<Wishlist>;
  remove(userId: string, productId: string): Promise<boolean>;
  merge(userId: string, productIds: string[]): Promise<Wishlist[]>;
}

const COLLECTION = "wishlists";

export const jsonWishlistRepo: WishlistRepository = {
  async listByUser(userId) {
    const rows = await readCollection<Wishlist>(COLLECTION);
    return rows
      .filter((w) => w.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async add(userId, productId) {
    let created: Wishlist | null = null;
    await mutateCollection<Wishlist>(COLLECTION, [], (rows) => {
      const existing = rows.find((w) => w.userId === userId && w.productId === productId);
      if (existing) {
        created = existing;
        return rows;
      }
      created = { id: newId("wsh"), userId, productId, createdAt: nowIso() };
      return [...rows, created];
    });
    return created!;
  },
  async remove(userId, productId) {
    let removed = false;
    await mutateCollection<Wishlist>(COLLECTION, [], (rows) => {
      const before = rows.length;
      const next = rows.filter((w) => !(w.userId === userId && w.productId === productId));
      removed = next.length < before;
      return next;
    });
    return removed;
  },
  async merge(userId, productIds) {
    const cleaned = Array.from(new Set(productIds.filter(Boolean)));
    let result: Wishlist[] = [];
    await mutateCollection<Wishlist>(COLLECTION, [], (rows) => {
      const own = rows.filter((w) => w.userId === userId);
      const existingIds = new Set(own.map((w) => w.productId));
      const toAdd: Wishlist[] = cleaned
        .filter((pid) => !existingIds.has(pid))
        .map((pid) => ({ id: newId("wsh"), userId, productId: pid, createdAt: nowIso() }));
      const next = [...rows, ...toAdd];
      result = next.filter((w) => w.userId === userId);
      return next;
    });
    return result;
  }
};
