import type { Order, OrderItem, OrderStatus } from "@/types/order";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export type OrderCreateInput = Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt" | "items"> & {
  items: Omit<OrderItem, "orderId">[];
};

export interface OrderRepository {
  create(input: OrderCreateInput): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  listByUser(userId: string): Promise<Order[]>;
  listAll(): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
  attachPayment(id: string, paymentId: string): Promise<Order | null>;
  findEligibleForReview(userId: string, productId: string): Promise<Order | null>;
}

const COLLECTION = "orders";

function nextOrderNumber(existing: Order[]): string {
  const year = new Date().getFullYear();
  const count = existing.filter((o) => o.orderNumber.startsWith(`UN-${year}-`)).length + 1;
  return `UN-${year}-${String(count).padStart(5, "0")}`;
}

// Back-fill fields added after the initial Order shape (discount, coupon snapshot).
function normalise(row: Order): Order {
  return {
    ...row,
    discountPaise: row.discountPaise ?? 0
  };
}

export const jsonOrderRepo: OrderRepository = {
  async create(input) {
    let created: Order | null = null;
    await mutateCollection<Order>(COLLECTION, [], (rows) => {
      const id = newId("ord");
      const order: Order = {
        ...input,
        id,
        orderNumber: nextOrderNumber(rows),
        items: input.items.map((i) => ({ ...i, orderId: id })),
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      created = order;
      return [...rows, order];
    });
    return created!;
  },
  async findById(id) {
    const rows = await readCollection<Order>(COLLECTION);
    const hit = rows.find((o) => o.id === id);
    return hit ? normalise(hit) : null;
  },
  async listByUser(userId) {
    const rows = await readCollection<Order>(COLLECTION);
    return rows
      .filter((o) => o.userId === userId)
      .map(normalise)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async listAll() {
    const rows = await readCollection<Order>(COLLECTION);
    return rows.map(normalise).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async updateStatus(id, status) {
    let updated: Order | null = null;
    await mutateCollection<Order>(COLLECTION, [], (rows) =>
      rows.map((o) => {
        if (o.id !== id) return o;
        updated = { ...o, status, updatedAt: nowIso() };
        return updated;
      })
    );
    return updated;
  },
  async attachPayment(id, paymentId) {
    let updated: Order | null = null;
    await mutateCollection<Order>(COLLECTION, [], (rows) =>
      rows.map((o) => {
        if (o.id !== id) return o;
        updated = { ...o, paymentId, updatedAt: nowIso() };
        return updated;
      })
    );
    return updated;
  },
  async findEligibleForReview(userId, productId) {
    const rows = await readCollection<Order>(COLLECTION);
    const eligibleStatuses: OrderStatus[] = ["paid", "packed", "shipped", "delivered"];
    return (
      rows
        .filter(
          (o) =>
            o.userId === userId &&
            eligibleStatuses.includes(o.status) &&
            o.items.some((i) => i.productId === productId)
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    );
  }
};
