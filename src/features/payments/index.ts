import type { PaymentProvider } from "./payment.provider";
import { createRazorpayProvider } from "./razorpay.provider";
import { createSimulateProvider } from "./simulate.provider";

let cached: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  const hasRazorpay = !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
  cached = hasRazorpay ? createRazorpayProvider() : createSimulateProvider();
  return cached;
}

export type { PaymentProvider } from "./payment.provider";
