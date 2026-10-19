export const RECOMMENDED_COURIERS = [
  "ST Courier",
  "Professional Courier",
  "India Post",
  "DTDC"
] as const;

export type RecommendedCourier = (typeof RECOMMENDED_COURIERS)[number];

export function isRecommendedCourier(value: string): value is RecommendedCourier {
  return (RECOMMENDED_COURIERS as readonly string[]).includes(value);
}
