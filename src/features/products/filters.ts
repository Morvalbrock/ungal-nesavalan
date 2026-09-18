import type { Fabric, Occasion, ProductQuery, Weave } from "@/types/product";

export const FABRICS: Fabric[] = ["silk", "cotton", "linen", "georgette", "chiffon", "organza", "crepe", "tissue"];
export const WEAVES: Weave[] = [
  "kanjivaram",
  "banarasi",
  "chanderi",
  "patola",
  "ikat",
  "jamdani",
  "bandhani",
  "paithani",
  "handloom",
  "printed"
];
export const OCCASIONS: Occasion[] = ["bridal", "festive", "party", "daily", "office", "casual"];

export const SORT_OPTIONS: { value: NonNullable<ProductQuery["sort"]>; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }
];

export const PRICE_BUCKETS: { min?: number; max?: number; label: string }[] = [
  { max: 500000, label: "Under ₹5,000" },
  { min: 500000, max: 1500000, label: "₹5,000 – ₹15,000" },
  { min: 1500000, max: 3000000, label: "₹15,000 – ₹30,000" },
  { min: 3000000, label: "Above ₹30,000" }
];

function readList<T extends string>(sp: URLSearchParams | Record<string, string | string[] | undefined>, key: string): T[] | undefined {
  const raw =
    sp instanceof URLSearchParams
      ? sp.getAll(key).flatMap((v) => v.split(","))
      : Array.isArray(sp[key])
      ? (sp[key] as string[]).flatMap((v) => v.split(","))
      : typeof sp[key] === "string"
      ? (sp[key] as string).split(",")
      : [];
  const cleaned = raw.filter(Boolean);
  return cleaned.length ? (cleaned as T[]) : undefined;
}

function readString(
  sp: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  if (sp instanceof URLSearchParams) return sp.get(key) ?? undefined;
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

function readNumber(
  sp: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string
): number | undefined {
  const s = readString(sp, key);
  if (s == null) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function readQueryFromSearchParams(
  sp: URLSearchParams | Record<string, string | string[] | undefined>
): ProductQuery {
  return {
    q: readString(sp, "q"),
    category: readString(sp, "category"),
    fabric: readList<Fabric>(sp, "fabric"),
    weave: readList<Weave>(sp, "weave"),
    occasion: readList<Occasion>(sp, "occasion"),
    minPrice: readNumber(sp, "minPrice"),
    maxPrice: readNumber(sp, "maxPrice"),
    sort: (readString(sp, "sort") as ProductQuery["sort"]) ?? undefined,
    page: readNumber(sp, "page"),
    perPage: readNumber(sp, "perPage")
  };
}
