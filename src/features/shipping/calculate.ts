import { ZONE_RATES, zoneForPincode, type ShippingZone } from "./zones";

export interface ShippingEta {
  zone: ShippingZone;
  zoneLabel: string;
  etaMinDays: number;
  etaMaxDays: number;
}

// Pincode drives ETA/zone-label only. Rate is state-based now and comes from
// `computeShipping` using admin-configured per-state charges — do not read
// ratePaise from the zone table anywhere.
const DEFAULT_ZONE: ShippingZone = "national";

export function shippingEta(input: { pincode?: string | null }): ShippingEta {
  const zone: ShippingZone = input.pincode ? zoneForPincode(input.pincode) : DEFAULT_ZONE;
  const rate = ZONE_RATES[zone];
  return {
    zone,
    zoneLabel: rate.label,
    etaMinDays: rate.etaMinDays,
    etaMaxDays: rate.etaMaxDays
  };
}

export function estimatedDeliveryLabel(eta: Pick<ShippingEta, "etaMinDays" | "etaMaxDays">): string {
  const now = new Date();
  const min = new Date(now.getTime() + eta.etaMinDays * 86400000);
  const max = new Date(now.getTime() + eta.etaMaxDays * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return `${fmt(min)} – ${fmt(max)}`;
}
