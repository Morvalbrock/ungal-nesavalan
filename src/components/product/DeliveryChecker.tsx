"use client";
import { useState, useTransition } from "react";
import { MapPin } from "lucide-react";

interface QuoteResponse {
  zoneLabel: string;
  etaLabel: string;
  serviceable: boolean;
  locationLabel: string | null;
}

export function DeliveryChecker() {
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
        `/api/shipping/quote?pincode=${encodeURIComponent(pincode.trim())}`
      );
      if (!res.ok) {
        setError("We couldn't check delivery. Try again.");
        return;
      }
      setQuote((await res.json()) as QuoteResponse);
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-purple-200/80 bg-purple-50/40 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-plum">
        <MapPin className="h-3.5 w-3.5 text-purple-600" />
        Check delivery to your pincode
      </div>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="e.g. 600001"
          className="flex-1 rounded-xl border border-purple-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand-purple"
        />
        <button type="submit" disabled={pending || pincode.length !== 6} className="btn-primary text-xs rounded-xl">
          {pending ? "…" : "Check"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      {quote && (
        <div className="mt-3 space-y-1 text-sm text-purple-950">
          {quote.locationLabel && (
            <p>
              <span className="text-purple-900/60 font-medium">Location:</span> {quote.locationLabel}
            </p>
          )}
          {!quote.serviceable ? (
            <p className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
              We don’t typically deliver to this pincode. Please contact our weavers before placing an order.
            </p>
          ) : (
            <>
              <p>
                <span className="text-purple-900/60 font-medium">Zone:</span> {quote.zoneLabel}
              </p>
              <p>
                <span className="text-purple-900/60 font-medium">Estimated Delivery:</span> {quote.etaLabel}
              </p>
              <p className="text-xs text-purple-900/60 pt-1">
                Fast courier delivery directly from Salem / Elampillai weaving hub.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
