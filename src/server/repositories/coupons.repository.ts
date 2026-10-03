import type { Coupon, CouponRedemption } from "@/types/coupon";
import { mutateCollection, newId, nowIso, readCollection } from "@/server/db/json-store";

export type CouponInput = Omit<Coupon, "id" | "createdAt" | "code"> & { code: string };

export interface CouponRepository {
  list(): Promise<Coupon[]>;
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  create(input: CouponInput): Promise<Coupon>;
  update(id: string, patch: Partial<Omit<Coupon, "id" | "code" | "createdAt">>): Promise<Coupon | null>;
  remove(id: string): Promise<boolean>;
  countRedemptions(couponId: string): Promise<number>;
  countUserRedemptions(couponId: string, userId: string): Promise<number>;
  recordRedemption(input: Omit<CouponRedemption, "id" | "createdAt">): Promise<CouponRedemption>;
}

const COLLECTION = "coupons";
const REDEMPTIONS = "coupon-redemptions";

export const jsonCouponRepo: CouponRepository = {
  async list() {
    const rows = await readCollection<Coupon>(COLLECTION);
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async findById(id) {
    const rows = await readCollection<Coupon>(COLLECTION);
    return rows.find((c) => c.id === id) ?? null;
  },
  async findByCode(code) {
    const rows = await readCollection<Coupon>(COLLECTION);
    const normalised = code.trim().toUpperCase();
    return rows.find((c) => c.code === normalised) ?? null;
  },
  async create(input) {
    let created: Coupon | null = null;
    await mutateCollection<Coupon>(COLLECTION, [], (rows) => {
      const code = input.code.trim().toUpperCase();
      if (rows.some((c) => c.code === code)) throw new Error("duplicate_code");
      created = { ...input, code, id: newId("cpn"), createdAt: nowIso() };
      return [...rows, created];
    });
    return created!;
  },
  async update(id, patch) {
    let updated: Coupon | null = null;
    await mutateCollection<Coupon>(COLLECTION, [], (rows) =>
      rows.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...patch };
        return updated;
      })
    );
    return updated;
  },
  async remove(id) {
    let removed = false;
    await mutateCollection<Coupon>(COLLECTION, [], (rows) => {
      const next = rows.filter((c) => c.id !== id);
      removed = next.length !== rows.length;
      return next;
    });
    return removed;
  },
  async countRedemptions(couponId) {
    const rows = await readCollection<CouponRedemption>(REDEMPTIONS);
    return rows.filter((r) => r.couponId === couponId).length;
  },
  async countUserRedemptions(couponId, userId) {
    const rows = await readCollection<CouponRedemption>(REDEMPTIONS);
    return rows.filter((r) => r.couponId === couponId && r.userId === userId).length;
  },
  async recordRedemption(input) {
    let created: CouponRedemption | null = null;
    await mutateCollection<CouponRedemption>(REDEMPTIONS, [], (rows) => {
      created = { ...input, id: newId("rdm"), createdAt: nowIso() };
      return [...rows, created];
    });
    return created!;
  }
};
