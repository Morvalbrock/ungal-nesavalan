"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { useCartHydrated, useCartStore, useCartTotals } from "@/features/cart/cart.store";
import { useAuth } from "@/features/auth/AuthContext";
import { track } from "@/features/analytics/track";
import type { AddressForm } from "@/features/checkout/checkout.schema";
import { AddressStep } from "./AddressStep";
import { ReviewStep } from "./ReviewStep";

type Step = "address" | "review";

export function CheckoutFlow({ prefill }: { prefill?: { name?: string; email?: string; phone?: string } }) {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const { subtotal, count } = useCartTotals();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<AddressForm | null>(null);

  // Fire begin_checkout once per checkout mount with a non-empty cart.
  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    track.beginCheckout({ subtotalInr: Math.round(subtotal / 100), itemCount: count });
    // Only fire once per mount:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Snapshot an abandoned cart when a logged-in shopper opens checkout with items
  // but doesn't complete. Called on mount + on unload.
  useEffect(() => {
    if (!hydrated || !user || items.length === 0) return;
    const snapshot = () => {
      const body = JSON.stringify({ items });
      // sendBeacon survives page unload; fetch fallback for initial mount.
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/abandoned-cart", blob);
      } else {
        void fetch("/api/abandoned-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true
        }).catch(() => undefined);
      }
    };
    const initial = setTimeout(snapshot, 4000);
    window.addEventListener("beforeunload", snapshot);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("beforeunload", snapshot);
    };
  }, [hydrated, user, items]);

  if (!hydrated) {
    return (
      <Container className="py-16">
        <div className="h-6 w-40 animate-pulse rounded bg-ink/5" />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-ink-muted">Add a saree before you head to checkout.</p>
        <Link href="/products" className="btn-primary mt-8 inline-flex">
          Explore sarees
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-4xl">Checkout</h1>
      <Steps step={step} onStepClick={(s) => (s === "address" ? setStep("address") : null)} />

      <div className="mt-10">
        {step === "address" && (
          <AddressStep
            initial={
              address ??
              (prefill
                ? ({
                    fullName: prefill.name ?? "",
                    email: prefill.email ?? "",
                    phone: prefill.phone ?? ""
                  } as Partial<AddressForm> as AddressForm)
                : undefined)
            }
            onSubmit={(data) => {
              setAddress(data);
              setStep("review");
              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
        {step === "review" && address && (
          <ReviewStep address={address} onEdit={() => setStep("address")} />
        )}
      </div>
    </Container>
  );
}

function Steps({ step, onStepClick }: { step: Step; onStepClick: (s: Step) => void }) {
  const stages: { key: Step; label: string; index: number }[] = [
    { key: "address", label: "Shipping", index: 1 },
    { key: "review", label: "Review", index: 2 }
  ];
  return (
    <ol className="mt-6 flex items-center gap-4 text-sm text-ink-muted">
      {stages.map((s, i) => {
        const active = s.key === step;
        const done = stages.findIndex((x) => x.key === step) > i;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick(s.key)}
              disabled={!done && !active}
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${
                active ? "border-ink bg-ink text-cream" : done ? "border-ink" : "border-border"
              }`}
            >
              {s.index}
            </button>
            <span className={active ? "text-ink" : done ? "text-ink" : ""}>{s.label}</span>
            {i < stages.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}
