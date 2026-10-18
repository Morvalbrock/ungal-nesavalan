import type { Announcement } from "@/types/announcement";
import { mutateCollection, newId, readCollection } from "@/server/db/json-store";

export interface AnnouncementRepository {
  list(): Promise<Announcement[]>;
  listActive(): Promise<Announcement[]>;
  findById(id: string): Promise<Announcement | null>;
  create(input: Omit<Announcement, "id">): Promise<Announcement>;
  update(id: string, patch: Partial<Announcement>): Promise<Announcement | null>;
  remove(id: string): Promise<boolean>;
}

const COLLECTION = "announcements";

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: "ann_1", text: "Free shipping across Tamil Nadu", link: "", sort: 1, active: true },
  { id: "ann_2", text: "Cash on delivery available", link: "", sort: 2, active: true },
  { id: "ann_3", text: "Handloom Mark certified · direct from master weavers", link: "", sort: 3, active: true },
  { id: "ann_4", text: "Complimentary blouse piece with every drape", link: "", sort: 4, active: true },
  { id: "ann_5", text: "Returns subject to policy · Unboxing video mandatory", link: "", sort: 5, active: true }
];

export const jsonAnnouncementRepo: AnnouncementRepository = {
  async list() {
    const rows = await readCollection<Announcement>(COLLECTION, DEFAULT_ANNOUNCEMENTS);
    return rows.slice().sort((a, b) => a.sort - b.sort);
  },
  async listActive() {
    const rows = await readCollection<Announcement>(COLLECTION, DEFAULT_ANNOUNCEMENTS);
    return rows.filter((a) => a.active).sort((a, b) => a.sort - b.sort);
  },
  async findById(id) {
    const rows = await readCollection<Announcement>(COLLECTION, DEFAULT_ANNOUNCEMENTS);
    return rows.find((a) => a.id === id) ?? null;
  },
  async create(input) {
    const created: Announcement = { ...input, id: newId("ann") };
    await mutateCollection<Announcement>(COLLECTION, DEFAULT_ANNOUNCEMENTS, (rows) => [...rows, created]);
    return created;
  },
  async update(id, patch) {
    let updated: Announcement | null = null;
    await mutateCollection<Announcement>(COLLECTION, DEFAULT_ANNOUNCEMENTS, (rows) =>
      rows.map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...patch, id: item.id };
        return updated;
      })
    );
    return updated;
  },
  async remove(id) {
    let removed = false;
    await mutateCollection<Announcement>(COLLECTION, DEFAULT_ANNOUNCEMENTS, (rows) => {
      const next = rows.filter((item) => item.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  }
};
