"use client";
import { create } from "zustand";

export interface AppliedCoupon {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  discountPaise: number;
  subtotalPaise: number;
}

interface AppliedCouponState {
  coupon: AppliedCoupon | null;
  apply: (c: AppliedCoupon) => void;
  clear: () => void;
}

export const useAppliedCouponStore = create<AppliedCouponState>((set) => ({
  coupon: null,
  apply: (coupon) => set({ coupon }),
  clear: () => set({ coupon: null })
}));
