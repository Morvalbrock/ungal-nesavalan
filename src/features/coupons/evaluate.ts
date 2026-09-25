import type { Coupon } from "@/types/coupon";
import { couponRepo } from "@/server/repositories";

export type CouponEvalError =
  | "not_found"
  | "inactive"
  | "expired"
  | "below_minimum"
  | "max_redemptions_reached"
  | "user_limit_reached";

export interface CouponEvalOk {
  ok: true;
  coupon: Coupon;
  discountPaise: number;
}

export interface CouponEvalErr {
  ok: false;
  error: CouponEvalError;
}

export async function evaluateCoupon({
  code,
  subtotalPaise,
  userId
}: {
  code: string;
  subtotalPaise: number;
  userId: string | null;
}): Promise<CouponEvalOk | CouponEvalErr> {
  const coupon = await couponRepo.findByCode(code);
  if (!coupon) return { ok: false, error: "not_found" };
  if (!coupon.active) return { ok: false, error: "inactive" };
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { ok: false, error: "expired" };
  }
  if (subtotalPaise < coupon.minSubtotalPaise) return { ok: false, error: "below_minimum" };

  if (coupon.maxRedemptions !== null) {
    const used = await couponRepo.countRedemptions(coupon.id);
    if (used >= coupon.maxRedemptions) return { ok: false, error: "max_redemptions_reached" };
  }
  if (userId && coupon.perUserLimit > 0) {
    const usedByUser = await couponRepo.countUserRedemptions(coupon.id, userId);
    if (usedByUser >= coupon.perUserLimit) return { ok: false, error: "user_limit_reached" };
  }

  const discountPaise =
    coupon.kind === "percent"
      ? Math.min(subtotalPaise, Math.floor((subtotalPaise * coupon.value) / 100))
      : Math.min(subtotalPaise, coupon.value);

  return { ok: true, coupon, discountPaise };
}

export function couponErrorMessage(err: CouponEvalError): string {
  switch (err) {
    case "not_found": return "That code isn't valid.";
    case "inactive": return "This coupon is no longer active.";
    case "expired": return "This coupon has expired.";
    case "below_minimum": return "Your subtotal is below this coupon's minimum.";
    case "max_redemptions_reached": return "This coupon has reached its usage limit.";
    case "user_limit_reached": return "You've already used this coupon.";
  }
}
