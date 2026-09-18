import { NextResponse } from "next/server";
import { productRepo } from "@/server/repositories";
import type { Fabric, Occasion, ProductQuery, Weave } from "@/types/product";

function parseList<T extends string>(sp: URLSearchParams, key: string): T[] | undefined {
  const all = sp.getAll(key).flatMap((v) => v.split(","));
  const cleaned = all.filter(Boolean);
  return cleaned.length ? (cleaned as T[]) : undefined;
}

function parseNumber(sp: URLSearchParams, key: string): number | undefined {
  const raw = sp.get(key);
  if (raw == null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const query: ProductQuery = {
    q: sp.get("q") ?? undefined,
    category: sp.get("category") ?? undefined,
    fabric: parseList<Fabric>(sp, "fabric"),
    weave: parseList<Weave>(sp, "weave"),
    occasion: parseList<Occasion>(sp, "occasion"),
    minPrice: parseNumber(sp, "minPrice"),
    maxPrice: parseNumber(sp, "maxPrice"),
    sort: (sp.get("sort") as ProductQuery["sort"]) ?? undefined,
    page: parseNumber(sp, "page"),
    perPage: parseNumber(sp, "perPage")
  };
  const result = await productRepo.list(query);
  return NextResponse.json(result);
}
