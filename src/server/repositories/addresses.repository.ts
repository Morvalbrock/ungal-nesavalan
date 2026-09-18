import type { Address, AddressInput } from "@/types/address";
import { mutateCollection, newId, readCollection } from "@/server/db/json-store";

export interface AddressRepository {
  listByUser(userId: string): Promise<Address[]>;
  findById(id: string, userId: string): Promise<Address | null>;
  create(userId: string, input: AddressInput): Promise<Address>;
  update(id: string, userId: string, patch: Partial<AddressInput>): Promise<Address | null>;
  remove(id: string, userId: string): Promise<boolean>;
}

const COLLECTION = "addresses";

async function ensureSingleDefault(rows: Address[], userId: string): Promise<Address[]> {
  const defaults = rows.filter((a) => a.userId === userId && a.isDefault);
  if (defaults.length <= 1) return rows;
  const [keep, ...rest] = defaults.sort((a, b) => a.id.localeCompare(b.id));
  return rows.map((a) => (rest.some((r) => r.id === a.id) ? { ...a, isDefault: false } : a));
}

export const jsonAddressRepo: AddressRepository = {
  async listByUser(userId) {
    const rows = await readCollection<Address>(COLLECTION);
    return rows
      .filter((a) => a.userId === userId)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  },
  async findById(id, userId) {
    const rows = await readCollection<Address>(COLLECTION);
    return rows.find((a) => a.id === id && a.userId === userId) ?? null;
  },
  async create(userId, input) {
    let created: Address | null = null;
    await mutateCollection<Address>(COLLECTION, [], async (rows) => {
      const own = rows.filter((a) => a.userId === userId);
      const isDefault = input.isDefault || own.length === 0;
      let next = rows.slice();
      if (isDefault) next = next.map((a) => (a.userId === userId ? { ...a, isDefault: false } : a));
      created = { ...input, id: newId("adr"), userId, isDefault };
      next.push(created);
      return ensureSingleDefault(next, userId);
    });
    return created!;
  },
  async update(id, userId, patch) {
    let updated: Address | null = null;
    await mutateCollection<Address>(COLLECTION, [], async (rows) => {
      let next = rows.map((a) => {
        if (a.id !== id || a.userId !== userId) return a;
        updated = { ...a, ...patch };
        return updated;
      });
      if (patch.isDefault && updated) {
        next = next.map((a) =>
          a.userId === userId && a.id !== id ? { ...a, isDefault: false } : a
        );
      }
      return ensureSingleDefault(next, userId);
    });
    return updated;
  },
  async remove(id, userId) {
    let removed = false;
    await mutateCollection<Address>(COLLECTION, [], async (rows) => {
      const target = rows.find((a) => a.id === id && a.userId === userId);
      if (!target) return rows;
      removed = true;
      let next = rows.filter((a) => a.id !== id);
      if (target.isDefault) {
        const nextDefault = next.find((a) => a.userId === userId);
        if (nextDefault) {
          next = next.map((a) => (a.id === nextDefault.id ? { ...a, isDefault: true } : a));
        }
      }
      return next;
    });
    return removed;
  }
};
