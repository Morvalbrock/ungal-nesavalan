export const RECOMMENDED_COURIERS = [
  "Delhivery",
  "Blue Dart",
  "DTDC",
  "India Post / Speed Post",
  "Ecom Express",
  "XpressBees"
] as const;

export type RecommendedCourier = (typeof RECOMMENDED_COURIERS)[number];

export function isRecommendedCourier(value: string): value is RecommendedCourier {
  return (RECOMMENDED_COURIERS as readonly string[]).includes(value);
}
