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
}

const COLLECTION = "orders";

function nextOrderNumber(existing: Order[]): string {
  const year = new Date().getFullYear();
  const count = existing.filter((o) => o.orderNumber.startsWith(`UN-${year}-`)).length + 1;
  return `UN-${year}-${String(count).padStart(5, "0")}`;
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
    return rows.find((o) => o.id === id) ?? null;
  },
  async listByUser(userId) {
    const rows = await readCollection<Order>(COLLECTION);
    return rows
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async listAll() {
    const rows = await readCollection<Order>(COLLECTION);
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
  }
};
