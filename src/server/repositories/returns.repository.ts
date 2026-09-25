import type { ReturnDecision, ReturnRequest } from "@/types/return-request";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface ReturnRepository {
  listAll(): Promise<ReturnRequest[]>;
  listPending(): Promise<ReturnRequest[]>;
  findByOrder(orderId: string): Promise<ReturnRequest | null>;
  findById(id: string): Promise<ReturnRequest | null>;
  create(input: Omit<ReturnRequest, "id" | "requestedAt" | "decision" | "decidedAt" | "adminNote" | "refundId">): Promise<ReturnRequest>;
  decide(id: string, decision: ReturnDecision, adminNote: string, refundId?: string): Promise<ReturnRequest | null>;
}

const COLLECTION = "return-requests";

export const jsonReturnRepo: ReturnRepository = {
  async listAll() {
    const rows = await readCollection<ReturnRequest>(COLLECTION);
    return rows.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  },
  async listPending() {
    const rows = await readCollection<ReturnRequest>(COLLECTION);
    return rows.filter((r) => !r.decision).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  },
  async findByOrder(orderId) {
    const rows = await readCollection<ReturnRequest>(COLLECTION);
    return rows.find((r) => r.orderId === orderId) ?? null;
  },
  async findById(id) {
    const rows = await readCollection<ReturnRequest>(COLLECTION);
    return rows.find((r) => r.id === id) ?? null;
  },
  async create(input) {
    let created: ReturnRequest | null = null;
    await mutateCollection<ReturnRequest>(COLLECTION, [], (rows) => {
      if (rows.some((r) => r.orderId === input.orderId)) throw new Error("already_requested");
      created = { ...input, id: newId("ret"), requestedAt: nowIso() };
      return [...rows, created];
    });
    return created!;
  },
  async decide(id, decision, adminNote, refundId) {
    let updated: ReturnRequest | null = null;
    await mutateCollection<ReturnRequest>(COLLECTION, [], (rows) =>
      rows.map((r) => {
        if (r.id !== id || r.decision) return r;
        updated = { ...r, decision, adminNote, refundId, decidedAt: nowIso() };
        return updated;
      })
    );
    return updated;
  }
};
