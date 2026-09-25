export type ShippingZone = "local" | "regional" | "national" | "remote";

export interface ZoneRate {
  zone: ShippingZone;
  label: string;
  ratePaise: number;
  freeAbovePaise: number;
  etaMinDays: number;
  etaMaxDays: number;
}

export const ZONE_RATES: Record<ShippingZone, ZoneRate> = {
  local: {
    zone: "local",
    label: "Tamil Nadu & neighbouring states",
    ratePaise: 4900,
    freeAbovePaise: 300000,
    etaMinDays: 2,
    etaMaxDays: 3
  },
  regional: {
    zone: "regional",
    label: "South & West India",
    ratePaise: 7900,
    freeAbovePaise: 500000,
    etaMinDays: 3,
    etaMaxDays: 5
  },
  national: {
    zone: "national",
    label: "Rest of India",
    ratePaise: 9900,
    freeAbovePaise: 500000,
    etaMinDays: 4,
    etaMaxDays: 7
  },
  remote: {
    zone: "remote",
    label: "North-East, J&K, Andaman",
    ratePaise: 14900,
    freeAbovePaise: 800000,
    etaMinDays: 6,
    etaMaxDays: 10
  }
};

// India pincode → zone based on first 1-2 digits.
// Origin: Kanchipuram, Tamil Nadu (631502). Zones are courier-realistic buckets.
export function zoneForPincode(pincode: string): ShippingZone {
  const clean = pincode.trim();
  if (!/^\d{6}$/.test(clean)) return "national";
  const first = clean[0];
  const two = clean.slice(0, 2);

  // Local: Tamil Nadu (6), Puducherry (6), Kerala (67-69), Karnataka (56-59), AP/TS (5)
  if (first === "6" || first === "5") return "local";

  // Regional: Maharashtra/Gujarat/MP/Chhattisgarh (3, 4)
  if (first === "4" || first === "3") return "regional";

  // Remote: NE states 78-79-793-799, J&K 18-19, Andaman 744
  if (two >= "78" && two <= "79") return "remote";
  if (two === "18" || two === "19") return "remote";
  if (clean.startsWith("744")) return "remote";

  // National: everything else (1, 2, 7, 8)
  return "national";
}
