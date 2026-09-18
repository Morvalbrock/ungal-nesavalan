import type { Payment, PaymentStatus } from "@/types/payment";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface PaymentRepository {
  create(input: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByProviderOrderId(providerOrderId: string): Promise<Payment | null>;
  updateStatus(
    id: string,
    patch: {
      status: PaymentStatus;
      providerPaymentId?: string;
      signature?: string;
      rawWebhookLog?: string;
    }
  ): Promise<Payment | null>;
}

const COLLECTION = "payments";

export const jsonPaymentRepo: PaymentRepository = {
  async create(input) {
    const created: Payment = { ...input, id: newId("pay"), createdAt: nowIso(), updatedAt: nowIso() };
    await mutateCollection<Payment>(COLLECTION, [], (rows) => [...rows, created]);
    return created;
  },
  async findById(id) {
    const rows = await readCollection<Payment>(COLLECTION);
    return rows.find((p) => p.id === id) ?? null;
  },
  async findByProviderOrderId(providerOrderId) {
    const rows = await readCollection<Payment>(COLLECTION);
    return rows.find((p) => p.providerOrderId === providerOrderId) ?? null;
  },
  async updateStatus(id, patch) {
    let updated: Payment | null = null;
    await mutateCollection<Payment>(COLLECTION, [], (rows) =>
      rows.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch, id: p.id, updatedAt: nowIso() };
        return updated;
      })
    );
    return updated;
  }
};
