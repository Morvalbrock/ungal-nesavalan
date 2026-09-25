import type { Order } from "@/types/order";
import type { User } from "@/types/user";
import { couponRepo } from "@/server/repositories";

// Generates (once) a personal referral coupon for a customer after a successful order.
// Idempotent: if a coupon with the same code already exists, returns it.
export async function getOrCreateReferralCoupon({
  user,
  order
}: {
  user: User;
  order: Order;
}): Promise<{ code: string; valueLabel: string } | null> {
  const code = referralCode(user, order);
  const existing = await couponRepo.findByCode(code);
  if (existing) return { code: existing.code, valueLabel: valueLabel(existing.kind, existing.value) };

  try {
    const created = await couponRepo.create({
      code,
      kind: "percent",
      value: 10,
      minSubtotalPaise: 200000,
      maxRedemptions: 100,
      perUserLimit: 1,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    });
    return { code: created.code, valueLabel: valueLabel(created.kind, created.value) };
  } catch {
    return null;
  }
}

function referralCode(user: User, order: Order): string {
  const firstName = user.name.split(/\s+/)[0]?.replace(/[^A-Za-z]/g, "").slice(0, 8).toUpperCase() || "FRIEND";
  const tail = order.id.slice(-4).toUpperCase();
  return `${firstName}-${tail}`;
}

function valueLabel(kind: "percent" | "fixed", value: number): string {
  return kind === "percent" ? `${value}% off` : `₹${Math.round(value / 100)} off`;
}
