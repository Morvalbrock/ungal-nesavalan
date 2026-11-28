"use client";
import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/cart.store";
import { useAppliedCouponStore } from "@/features/coupons/applied-coupon.store";
import type { AddressForm } from "@/features/checkout/checkout.schema";
import { formatINR } from "@/lib/utils";

function makeIdempotencyKey(): string {
  // Prefer crypto.randomUUID; fall back to a reasonably collision-resistant stamp
  // on older browsers that don't expose it (e.g. older iOS Safari in the wild).
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ik_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

type CreateOrderResponse = {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  keyId: string;
  amountPaise: number;
  currency: "INR";
  mode: "razorpay" | "simulate";
  customer: { name: string; email: string; phone: string };
};

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
  on?: (event: string, callback: (response: { error?: { description?: string; code?: string } }) => void) => void;
}
declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOptions) => RazorpayInstance;
  }
}

export function PayButton({
  address,
  disabled,
  amountPaise,
  couponCode,
  preferredCourier,
  paymentMode = "prepaid",
  dueOnDeliveryPaise = 0
}: {
  address: AddressForm;
  disabled?: boolean;
  amountPaise: number;
  couponCode?: string;
  preferredCourier?: string;
  paymentMode?: "prepaid" | "cod";
  dueOnDeliveryPaise?: number;
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const clearCoupon = useAppliedCouponStore((s) => s.clear);
  const [scriptReady, setScriptReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stable per-mount key so retries of the same checkout attempt dedupe
  // server-side rather than creating a second order.
  const idempotencyKeyRef = useRef<string>(makeIdempotencyKey());

  const confirm = useCallback(
    async (data: {
      orderId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => {
      const res = await fetch("/api/checkout/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Payment could not be confirmed");
        setBusy(false);
        return;
      }
      clear();
      clearCoupon();
      router.push(`/checkout/success/${data.orderId}`);
    },
    [clear, clearCoupon, router]
  );

  const start = useCallback(async () => {
    setError(null);
    setBusy(true);

    const res = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        couponCode,
        preferredCourier,
        paymentMode,
        idempotencyKey: idempotencyKeyRef.current,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          size: i.size
        }))
      })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      setError(body.message ?? "Could not create the order");
      setBusy(false);
      return;
    }
    const data = (await res.json()) as CreateOrderResponse;

    if (data.mode === "simulate") {
      await confirm({
        orderId: data.orderId,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: `sim_pay_${Date.now()}`,
        razorpaySignature: "simulated"
      });
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      setError("Razorpay SDK failed to load. Refresh and try again.");
      setBusy(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amountPaise,
      currency: data.currency,
      name: "Ungal Nesavalan",
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      prefill: {
        name: data.customer.name,
        email: data.customer.email,
        contact: data.customer.phone
      },
      theme: { color: "#4a0e4e" },
      modal: {
        ondismiss: () => {
          setBusy(false);
        }
      },
      handler: (r) => {
        void confirm({
          orderId: data.orderId,
          razorpayOrderId: r.razorpay_order_id,
          razorpayPaymentId: r.razorpay_payment_id,
          razorpaySignature: r.razorpay_signature
        });
      }
    });

    rzp.on?.("payment.failed", (response) => {
      setError(response.error?.description || "Payment failed. Please try again or use another payment method.");
      setBusy(false);
    });

    rzp.open();
  }, [address, items, couponCode, preferredCourier, paymentMode, confirm, router]);

  return (
    <div>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <button
        type="button"
        onClick={start}
        disabled={disabled || busy || items.length === 0}
        className="btn-primary w-full sm:w-auto font-semibold shadow-md shadow-brand-deep/20 text-sm py-3.5 px-8"
      >
        {busy
          ? "Securing Loom Order…"
          : paymentMode === "cod"
            ? `Pay ${formatINR(amountPaise)} Deposit & Confirm Booking`
            : `Pay ${formatINR(amountPaise)} & Place Order`}
      </button>
      {paymentMode === "cod" && dueOnDeliveryPaise > 0 && (
        <p className="mt-2 text-xs text-purple-950 font-medium">
          Balance {formatINR(dueOnDeliveryPaise)} will be collected in cash upon delivery.
        </p>
      )}
      {error && <p className="mt-3 text-xs text-rose-600 font-medium">{error}</p>}
      <p className="mt-3 text-xs text-purple-900/60">
        {scriptReady ? "Direct Weaver Verification · 256-bit SSL Encrypted Payment" : "Loading secure payment…"}
      </p>
    </div>
  );
}
