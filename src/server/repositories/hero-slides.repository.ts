import type { HeroSlide } from "@/types/hero-slide";
import { mutateCollection, newId, readCollection } from "@/server/db/json-store";

export interface HeroSlideRepository {
  list(): Promise<HeroSlide[]>;
  listActive(): Promise<HeroSlide[]>;
  findById(id: string): Promise<HeroSlide | null>;
  create(input: Omit<HeroSlide, "id">): Promise<HeroSlide>;
  update(id: string, patch: Partial<HeroSlide>): Promise<HeroSlide | null>;
  remove(id: string): Promise<boolean>;
}

const COLLECTION = "hero-slides";

export const jsonHeroSlideRepo: HeroSlideRepository = {
  async list() {
    const rows = await readCollection<HeroSlide>(COLLECTION);
    return rows.slice().sort((a, b) => a.sort - b.sort);
  },
  async listActive() {
    const rows = await readCollection<HeroSlide>(COLLECTION);
    return rows.filter((s) => s.active).sort((a, b) => a.sort - b.sort);
  },
  async findById(id) {
    const rows = await readCollection<HeroSlide>(COLLECTION);
    return rows.find((s) => s.id === id) ?? null;
  },
  async create(input) {
    const created: HeroSlide = { ...input, id: newId("hs") };
    await mutateCollection<HeroSlide>(COLLECTION, [], (rows) => [...rows, created]);
    return created;
  },
  async update(id, patch) {
    let updated: HeroSlide | null = null;
    await mutateCollection<HeroSlide>(COLLECTION, [], (rows) =>
      rows.map((s) => {
        if (s.id !== id) return s;
        updated = { ...s, ...patch, id: s.id };
        return updated;
      })
    );
    return updated;
  },
  async remove(id) {
    let removed = false;
    await mutateCollection<HeroSlide>(COLLECTION, [], (rows) => {
      const next = rows.filter((s) => s.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  }
};
