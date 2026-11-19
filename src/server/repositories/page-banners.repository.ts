import type { PageBanner } from "@/types/page-banner";
import { mutateCollection, readCollection } from "@/server/db/json-store";

export interface PageBannerRepository {
  list(): Promise<PageBanner[]>;
  findByPage(page: string): Promise<PageBanner | null>;
  findById(id: string): Promise<PageBanner | null>;
  upsert(input: Omit<PageBanner, "updatedAt">): Promise<PageBanner>;
}

const COLLECTION = "page-banners";

const DEFAULT_BANNERS: PageBanner[] = [
  {
    "id": "products",
    "page": "/products",
    "title": "All Sarees",
    "subtitle": "Authentic Elampillai silk-cotton, soft silk, and bridal sarees woven directly on our own pit-looms — honest pricing direct from master weavers.",
    "imageUrl": "/images/authentic_indian_handloom_silk_saree.png"
  },
  {
    "id": "about",
    "page": "/about",
    "title": "Our Weavers",
    "subtitle": "Rooted in Elampillai, Salem, dedicated to pure handloom heritage across Tamil Nadu.",
    "imageUrl": "/images/authentic_indian_handloom_silk_saree.png"
  },
  {
    "id": "journal",
    "page": "/journal",
    "title": "Stories from the loom",
    "subtitle": "Weaver profiles, care notes, and dispatches from our Salem handloom workshops.",
    "imageUrl": "/images/authentic_indian_handloom_silk_saree.png"
  }
];

export const jsonPageBannerRepo: PageBannerRepository = {
  async list() {
    const rows = await readCollection<PageBanner>(COLLECTION, DEFAULT_BANNERS);
    return rows;
  },
  async findByPage(page: string) {
    const rows = await readCollection<PageBanner>(COLLECTION, DEFAULT_BANNERS);
    return rows.find((b) => b.page === page || b.id === page.replace(/^\//, "")) ?? null;
  },
  async findById(id: string) {
    const rows = await readCollection<PageBanner>(COLLECTION, DEFAULT_BANNERS);
    return rows.find((b) => b.id === id) ?? null;
  },
  async upsert(input) {
    const now = new Date().toISOString();
    let saved: PageBanner | null = null;
    await mutateCollection<PageBanner>(COLLECTION, DEFAULT_BANNERS, (rows) => {
      const idx = rows.findIndex((b) => b.id === input.id);
      if (idx >= 0) {
        saved = { ...rows[idx], ...input, updatedAt: now };
        const copy = [...rows];
        copy[idx] = saved;
        return copy;
      }
      saved = { ...input, updatedAt: now };
      return [...rows, saved];
    });
    return saved!;
  }
};
