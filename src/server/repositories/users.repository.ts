import type { User } from "@/types/user";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: Omit<User, "id" | "createdAt">): Promise<User>;
  update(id: string, patch: Partial<User>): Promise<User | null>;
  list(): Promise<User[]>;
}

const COLLECTION = "users";

export const jsonUserRepo: UserRepository = {
  async findByEmail(email) {
    const rows = await readCollection<User>(COLLECTION);
    const normalized = email.trim().toLowerCase();
    return rows.find((u) => u.email.toLowerCase() === normalized) ?? null;
  },
  async findById(id) {
    const rows = await readCollection<User>(COLLECTION);
    return rows.find((u) => u.id === id) ?? null;
  },
  async create(input) {
    const created: User = {
      ...input,
      email: input.email.trim().toLowerCase(),
      id: newId("usr"),
      createdAt: nowIso()
    };
    await mutateCollection<User>(COLLECTION, [], (rows) => [...rows, created]);
    return created;
  },
  async update(id, patch) {
    let updated: User | null = null;
    await mutateCollection<User>(COLLECTION, [], (rows) =>
      rows.map((u) => {
        if (u.id !== id) return u;
        updated = { ...u, ...patch, id: u.id };
        return updated;
      })
    );
    return updated;
  },
  async list() {
    return readCollection<User>(COLLECTION);
  }
};
