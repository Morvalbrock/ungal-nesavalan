import type { PasswordResetToken } from "@/types/password-reset";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface PasswordResetRepository {
  create(input: { userId: string; tokenHash: string; expiresAt: string }): Promise<PasswordResetToken>;
  findById(id: string): Promise<PasswordResetToken | null>;
  markUsed(id: string): Promise<boolean>;
  invalidateAllForUser(userId: string): Promise<void>;
}

const COLLECTION = "password-reset-tokens";

export const jsonPasswordResetRepo: PasswordResetRepository = {
  async create(input) {
    const token: PasswordResetToken = {
      id: newId("prt"),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      usedAt: null,
      createdAt: nowIso()
    };
    await mutateCollection<PasswordResetToken>(COLLECTION, [], (rows) => [...rows, token]);
    return token;
  },
  async findById(id) {
    const rows = await readCollection<PasswordResetToken>(COLLECTION);
    return rows.find((r) => r.id === id) ?? null;
  },
  async markUsed(id) {
    let changed = false;
    const now = nowIso();
    await mutateCollection<PasswordResetToken>(COLLECTION, [], (rows) =>
      rows.map((r) => {
        if (r.id !== id || r.usedAt) return r;
        changed = true;
        return { ...r, usedAt: now };
      })
    );
    return changed;
  },
  async invalidateAllForUser(userId) {
    const now = nowIso();
    await mutateCollection<PasswordResetToken>(COLLECTION, [], (rows) =>
      rows.map((r) => (r.userId === userId && !r.usedAt ? { ...r, usedAt: now } : r))
    );
  }
};
