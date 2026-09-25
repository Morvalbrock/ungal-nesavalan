"use client";
import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Props {
  subtotalPaise: number;
}

interface QuoteResponse {
  zoneLabel: string;
  ratePaise: number;
  qualifiesForFreeShipping: boolean;
  freeShippingRemainingPaise: number;
  etaLabel: string;
}

export function DeliveryChecker({ subtotalPaise }: Props) {
  const [pincode, setPincode] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setQuote(null);
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Enter a 6-digit Indian pincode.");
      return;
    }
    startTransition(async () => {
      const res = await fetch(
        `/api/shipping/quote?pincode=${encodeURIComponent(pincode.trim())}&subtotalPaise=${subtotalPaise}`
      );
      if (!res.ok) {
        setError("We couldn't fetch a rate. Try again.");
        return;
      }
      setQuote((await res.json()) as QuoteResponse);
    });
  }

  return (
    <div className="mt-6 rounded-card border border-border/70 bg-cream-warm/40 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-muted">
        <MapPin className="h-3.5 w-3.5" />
        Check delivery to your pincode
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="e.g. 600001"
          className="flex-1 rounded-card border border-border bg-cream px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button type="submit" disabled={pending || pincode.length !== 6} className="btn-primary text-xs">
          {pending ? "…" : "Check"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-maroon">{error}</p>}
      {quote && (
        <div className="mt-3 space-y-1 text-sm text-ink-soft">
          <p>
            <span className="text-ink-muted">Zone:</span> {quote.zoneLabel}
          </p>
          <p>
            <span className="text-ink-muted">Delivery:</span> {quote.etaLabel}
          </p>
          <p>
            <span className="text-ink-muted">Shipping:</span>{" "}
            {quote.ratePaise === 0 ? (
              <span className="font-medium text-emerald-700">Free</span>
            ) : (
              formatINR(quote.ratePaise)
            )}
          </p>
          {!quote.qualifiesForFreeShipping && quote.freeShippingRemainingPaise > 0 && (
            <p className="text-xs text-ink-muted">
              Add {formatINR(quote.freeShippingRemainingPaise)} more for free shipping to this zone.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
