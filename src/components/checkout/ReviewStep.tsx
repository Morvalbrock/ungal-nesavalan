"use client";
import { useEffect, useMemo, useState } from "react";
import { CartLine } from "@/components/cart/CartLine";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore, useCartTotals } from "@/features/cart/cart.store";
import { useAppliedCouponStore } from "@/features/coupons/applied-coupon.store";
import type { AddressForm } from "@/features/checkout/checkout.schema";
import type { ShippingCharge, ShippingDefaults } from "@/types/shipping-charge";
import { shippingEta, estimatedDeliveryLabel } from "@/features/shipping/calculate";
import { computeShipping } from "@/features/shipping/compute-shipping";
import { RECOMMENDED_COURIERS, isRecommendedCourier } from "@/features/shipping/couriers";
import { cn, formatINR } from "@/lib/utils";
import { CouponBox } from "./CouponBox";
import { PayButton } from "./PayButton";

interface CodQuoteResponse {
  eligible: boolean;
  depositPaise: number;
  dueOnDeliveryPaise: number;
  minOrderPaise: number;
}

function isTamilNaduPincode(pincode: string | undefined): boolean {
  const p = (pincode ?? "").trim();
  if (!/^\d{6}$/.test(p)) return false;
  const n = parseInt(p, 10);
  if (n < 600001 || n > 643999) return false;
  const prefix = p.slice(0, 3);
  // Puducherry UT pockets within the 6xx series
  if (prefix === "605" || prefix === "607" || prefix === "609") return false;
  return true;
}

function isTamilNaduState(state: string | undefined): boolean {
  const s = (state ?? "").trim().toLowerCase();
  return s === "tamil nadu" || s === "tamilnadu" || s === "tn";
}

function isTamilNaduAddress(address: { state?: string; pincode?: string }): boolean {
  return isTamilNaduPincode(address.pincode) || isTamilNaduState(address.state);
}

export function ReviewStep({
  address,
  onEdit,
  preferredCourier,
  onPreferredCourierChange,
  paymentMode,
  onPaymentModeChange,
  shippingCharges,
  shippingDefaults
}: {
  address: AddressForm;
  onEdit: () => void;
  preferredCourier: string;
  onPreferredCourierChange: (value: string) => void;
  paymentMode: "prepaid" | "cod";
  onPaymentModeChange: (value: "prepaid" | "cod") => void;
  shippingCharges: ShippingCharge[];
  shippingDefaults: ShippingDefaults;
}) {
  const items = useCartStore((s) => s.items);
  const totals = useCartTotals();
  const applied = useAppliedCouponStore((s) => s.coupon);
  const discount = applied?.subtotalPaise === totals.subtotal ? applied.discountPaise : 0;

  const shipping = useMemo(
    () =>
      computeShipping({
        state: address.state,
        subtotalPaise: totals.subtotal,
        charges: shippingCharges,
        defaults: shippingDefaults
      }),
    [address.state, totals.subtotal, shippingCharges, shippingDefaults]
  );
  const eta = useMemo(() => shippingEta({ pincode: address.pincode }), [address.pincode]);
  const payable = Math.max(0, totals.subtotal - discount + shipping.shippingPaise);

  useEffect(() => {
    if (!preferredCourier || !isRecommendedCourier(preferredCourier)) {
      onPreferredCourierChange(RECOMMENDED_COURIERS[0]);
    }
  }, [preferredCourier, onPreferredCourierChange]);

  // Payment method handling — fetch category-aware COD quote from the server.
  const isTnAddress = isTamilNaduAddress({ state: address.state, pincode: address.pincode });
  const [codQuote, setCodQuote] = useState<CodQuoteResponse | null>(null);

  const codRequestKey = useMemo(
    () =>
      JSON.stringify({
        payable,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPricePaise: i.unitPricePaise
        }))
      }),
    [payable, items]
  );

  useEffect(() => {
    if (items.length === 0 || payable <= 0) {
      setCodQuote(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/cod-quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            payablePaise: payable,
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPricePaise: i.unitPricePaise
            }))
          })
        });
        if (!res.ok) throw new Error("cod_quote_failed");
        const data = (await res.json()) as CodQuoteResponse;
        if (!cancelled) setCodQuote(data);
      } catch {
        if (!cancelled) setCodQuote(null);
      }
    })();
    return () => {
      cancelled = true;
    };
    // codRequestKey captures items + payable; linter needs the raw deps too.
  }, [codRequestKey, items, payable]);

  const canUseCod = isTnAddress && (codQuote?.eligible ?? false);
  const codDeposit = codQuote?.depositPaise ?? 0;
  const codDue = codQuote?.dueOnDeliveryPaise ?? Math.max(0, payable - codDeposit);
  const codMinOrderPaise = codQuote?.minOrderPaise ?? 0;

  useEffect(() => {
    if (!canUseCod && paymentMode === "cod") {
      onPaymentModeChange("prepaid");
    }
  }, [canUseCod, paymentMode, onPaymentModeChange]);

  const chargeNowPaise = paymentMode === "cod" ? codDeposit : payable;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Shipping to</h2>
            <button type="button" onClick={onEdit} className="text-sm underline text-ink-muted hover:text-ink">
              Edit
            </button>
          </div>
          <div className="mt-3 rounded-card border border-border p-4 text-sm leading-relaxed">
            <p className="font-medium">{address.fullName}</p>
            <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
            <p>{address.city}, {address.state} {address.pincode}</p>
            <p>{address.country} · {address.phone}</p>
            <p className="text-ink-muted">{address.email}</p>
            {address.notes && <p className="mt-2 text-ink-soft">Note: {address.notes}</p>}
          </div>
          <div className="mt-3 rounded-card bg-cream-warm/60 p-3 text-xs text-ink-soft">
            <p>
              <span className="text-ink-muted">Shipping:</span>{" "}
              {shipping.shippingPaise === 0 ? (
                <span className="font-medium text-emerald-700">Free</span>
              ) : (
                formatINR(shipping.shippingPaise)
              )}
              {" · "}
              <span className="text-ink-muted">Arrives</span> {estimatedDeliveryLabel(eta)}
            </p>
          </div>
          {shipping.usedFallback && (
            <div className="mt-2 rounded-card border border-amber-500/40 bg-amber-50 p-3 text-xs text-amber-900">
              Shipping to <strong>{address.state}</strong> uses our default rate. Please contact
              support for an exact quote before placing this order.
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl">Preferred courier</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Select your preferred courier service for delivery.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {RECOMMENDED_COURIERS.map((c) => {
              const selected = preferredCourier === c;
              return (
                <label
                  key={c}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-card border p-3 text-sm transition",
                    selected
                      ? "border-ink bg-cream/40 font-medium text-ink shadow-xs"
                      : "border-border hover:border-ink/60 text-ink-soft hover:text-ink"
                  )}
                >
                  <input
                    type="radio"
                    name="preferredCourier"
                    checked={selected}
                    onChange={() => onPreferredCourierChange(c)}
                    className="accent-ink"
                  />
                  <span>{c}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Payment method</h2>
          <div className="mt-3 space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-card border border-border p-3 text-sm hover:border-ink">
              <input
                type="radio"
                name="paymentMode"
                checked={paymentMode === "prepaid"}
                onChange={() => onPaymentModeChange("prepaid")}
                className="mt-0.5 accent-ink"
              />
              <div>
                <p className="font-medium">Pay full amount now</p>
                <p className="text-xs text-ink-muted">Secure payment via UPI, card, or netbanking.</p>
              </div>
            </label>
            <label
              className={`flex items-start gap-3 rounded-card border p-3 text-sm ${
                canUseCod
                  ? "cursor-pointer border-border hover:border-ink"
                  : "cursor-not-allowed border-border/60 opacity-60"
              }`}
            >
              <input
                type="radio"
                name="paymentMode"
                checked={paymentMode === "cod"}
                onChange={() => canUseCod && onPaymentModeChange("cod")}
                disabled={!canUseCod}
                className="mt-0.5 accent-ink"
              />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                {canUseCod ? (
                  <p className="text-xs text-ink-muted">
                    Pay <strong>{formatINR(codDeposit)}</strong> deposit now · {formatINR(codDue)} in cash on delivery
                  </p>
                ) : !isTnAddress ? (
                  <p className="text-xs text-ink-muted">
                    Cash on Delivery is available only for Tamil Nadu addresses (pincode 600001–643999).
                  </p>
                ) : (
                  <p className="text-xs text-ink-muted">
                    {codMinOrderPaise > 0
                      ? `Available on orders of ${formatINR(codMinOrderPaise)} and above`
                      : "Checking eligibility…"}
                  </p>
                )}
              </div>
            </label>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Your order</h2>
          <div className="mt-3">
            {items.map((i) => <CartLine key={i.variantId} item={i} compact />)}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Coupon</h2>
          <div className="mt-3">
            <CouponBox />
          </div>
        </section>

        <PayButton
          address={address}
          amountPaise={chargeNowPaise}
          couponCode={applied?.code}
          preferredCourier={preferredCourier || undefined}
          paymentMode={paymentMode}
          dueOnDeliveryPaise={paymentMode === "cod" ? codDue : 0}
          disabled={items.length === 0}
        />
      </div>

      <div>
        <CartSummary showCheckoutButton={false} shippingPaise={shipping.shippingPaise} />
      </div>
    </div>
  );
}
