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
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
      <div className="space-y-6">
        {/* Shipping address card */}
        <section className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-heritage text-xl font-bold text-brand-plum">Delivery Destination</h2>
            <button type="button" onClick={onEdit} className="text-xs font-semibold text-brand-purple hover:underline">
              Edit Address
            </button>
          </div>
          <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/20 p-4 text-xs sm:text-sm leading-relaxed text-slate-700">
            <p className="font-bold text-brand-plum">{address.fullName}</p>
            <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
            <p>{address.city}, {address.state} {address.pincode}</p>
            <p>{address.country} · {address.phone}</p>
            <p className="text-purple-900/60">{address.email}</p>
            {address.notes && <p className="mt-2 text-purple-950 font-medium bg-purple-50 p-2 rounded-lg">Note: {address.notes}</p>}
          </div>
          <div className="mt-3 rounded-xl bg-purple-50/60 border border-purple-100 p-3 text-xs text-purple-950">
            <p>
              <span className="text-purple-900/60 font-medium">Shipping Charge:</span>{" "}
              {shipping.shippingPaise === 0 ? (
                <span className="font-bold text-emerald-700">Free</span>
              ) : (
                <span className="font-semibold">{formatINR(shipping.shippingPaise)}</span>
              )}
              {" · "}
              <span className="text-purple-900/60 font-medium">Estimated Arrival:</span> {estimatedDeliveryLabel(eta)}
            </p>
          </div>
          {shipping.usedFallback && (
            <div className="mt-2 rounded-xl border border-amber-500/40 bg-amber-50 p-3 text-xs text-amber-900">
              Shipping to <strong>{address.state}</strong> uses our standard handloom courier rate.
            </div>
          )}
        </section>

        {/* Preferred Courier */}
        <section className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-6 shadow-xs">
          <h2 className="font-heritage text-xl font-bold text-brand-plum">Preferred Courier Partner</h2>
          <p className="mt-1 text-xs text-purple-900/60">
            All dispatches are tracked directly from Salem/Elampillai hub.
          </p>
          <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
            {RECOMMENDED_COURIERS.map((c) => {
              const selected = preferredCourier === c;
              return (
                <label
                  key={c}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition",
                    selected
                      ? "border-brand-purple bg-purple-50/70 font-semibold text-brand-plum ring-1 ring-brand-purple/30"
                      : "border-purple-200/80 bg-white hover:border-brand-purple/50 text-slate-700"
                  )}
                >
                  <input
                    type="radio"
                    name="preferredCourier"
                    checked={selected}
                    onChange={() => onPreferredCourierChange(c)}
                    className="accent-purple-800"
                  />
                  <span>{c}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Payment mode */}
        <section className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-6 shadow-xs">
          <h2 className="font-heritage text-xl font-bold text-brand-plum">Payment Options</h2>
          <div className="mt-3.5 space-y-2.5">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-purple-200/80 p-3.5 text-sm hover:border-brand-purple transition bg-purple-50/20">
              <input
                type="radio"
                name="paymentMode"
                checked={paymentMode === "prepaid"}
                onChange={() => onPaymentModeChange("prepaid")}
                className="mt-0.5 accent-purple-800"
              />
              <div>
                <p className="font-bold text-brand-plum">Pay Full Amount Now (UPI, Cards, Netbanking)</p>
                <p className="text-xs text-purple-900/60">Instant verification · Priority dispatch from loom within 24 hours.</p>
              </div>
            </label>
            <label
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm transition ${
                canUseCod
                  ? "cursor-pointer border-purple-200/80 hover:border-brand-purple bg-purple-50/20"
                  : "cursor-not-allowed border-purple-100 bg-slate-50 opacity-60"
              }`}
            >
              <input
                type="radio"
                name="paymentMode"
                checked={paymentMode === "cod"}
                onChange={() => canUseCod && onPaymentModeChange("cod")}
                disabled={!canUseCod}
                className="mt-0.5 accent-purple-800"
              />
              <div>
                <p className="font-bold text-brand-plum">Cash on Delivery (Tamil Nadu Exclusive)</p>
                {canUseCod ? (
                  <p className="text-xs text-purple-900/70">
                    Pay <strong>{formatINR(codDeposit)}</strong> deposit now to confirm loom booking · {formatINR(codDue)} cash upon delivery.
                  </p>
                ) : !isTnAddress ? (
                  <p className="text-xs text-purple-900/60">
                    Cash on Delivery is available across Tamil Nadu (pincodes 600001–643999).
                  </p>
                ) : (
                  <p className="text-xs text-purple-900/60">
                    {codMinOrderPaise > 0
                      ? `Available on orders of ${formatINR(codMinOrderPaise)} and above`
                      : "Checking eligibility…"}
                  </p>
                )}
              </div>
            </label>
          </div>
        </section>

        {/* Order items */}
        <section className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-6 shadow-xs">
          <h2 className="font-heritage text-xl font-bold text-brand-plum">Selected Sarees ({items.length})</h2>
          <div className="mt-3">
            {items.map((i) => <CartLine key={i.variantId} item={i} compact />)}
          </div>
        </section>

        {/* Coupon */}
        <section className="rounded-2xl border border-purple-100 bg-white p-5 sm:p-6 shadow-xs">
          <h2 className="font-heritage text-xl font-bold text-brand-plum mb-3">Apply Coupon or Gift Code</h2>
          <div>
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
