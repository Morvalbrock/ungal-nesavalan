import { ZONE_RATES, zoneForPincode, type ShippingZone, type ZoneRate } from "./zones";

export interface ShippingQuote {
  zone: ShippingZone;
  zoneLabel: string;
  ratePaise: number;
  freeAbovePaise: number;
  freeShippingRemainingPaise: number;
  qualifiesForFreeShipping: boolean;
  etaMinDays: number;
  etaMaxDays: number;
}

// Default zone used when no pincode has been entered yet.
// Matches the previous flat-rate behaviour (₹99 above ₹5000 free).
const DEFAULT_ZONE: ShippingZone = "national";

export function shippingQuote(input: { subtotalPaise: number; pincode?: string | null }): ShippingQuote {
  const zone: ShippingZone = input.pincode ? zoneForPincode(input.pincode) : DEFAULT_ZONE;
  const rate: ZoneRate = ZONE_RATES[zone];

  const qualifies = input.subtotalPaise >= rate.freeAbovePaise;
  const ratePaise = input.subtotalPaise === 0 ? 0 : qualifies ? 0 : rate.ratePaise;

  return {
    zone,
    zoneLabel: rate.label,
    ratePaise,
    freeAbovePaise: rate.freeAbovePaise,
    freeShippingRemainingPaise: Math.max(0, rate.freeAbovePaise - input.subtotalPaise),
    qualifiesForFreeShipping: qualifies,
    etaMinDays: rate.etaMinDays,
    etaMaxDays: rate.etaMaxDays
  };
}

export function estimatedDeliveryLabel(quote: ShippingQuote): string {
  const now = new Date();
  const min = new Date(now.getTime() + quote.etaMinDays * 86400000);
  const max = new Date(now.getTime() + quote.etaMaxDays * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return `${fmt(min)} – ${fmt(max)}`;
}
