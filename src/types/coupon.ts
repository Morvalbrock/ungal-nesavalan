export type CouponKind = "percent" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  kind: CouponKind;
  value: number;
  minSubtotalPaise: number;
  maxRedemptions: number | null;
  perUserLimit: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  amountAppliedPaise: number;
  createdAt: string;
}

export interface CouponSnapshot {
  code: string;
  kind: CouponKind;
  value: number;
}
