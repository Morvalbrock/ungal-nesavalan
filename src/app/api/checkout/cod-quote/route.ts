import { NextResponse } from "next/server";
import { z } from "zod";
import { categoryRepo, productRepo } from "@/server/repositories";
import { computeCodDepositForCart, type CodCartLine } from "@/features/checkout/cod";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(30),
        unitPricePaise: z.number().int().min(0)
      })
    )
    .min(1),
  payablePaise: z.number().int().min(0)
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { items, payablePaise } = parsed.data;

  const uniqueProductIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await Promise.all(uniqueProductIds.map((id) => productRepo.findById(id)));
  const categoryByProduct = new Map<string, string>();
  for (const p of products) {
    if (p) categoryByProduct.set(p.id, p.categoryId);
  }

  const codLines: CodCartLine[] = items.map((i) => ({
    productId: i.productId,
    categoryId: categoryByProduct.get(i.productId) ?? "",
    linePaise: i.unitPricePaise * i.quantity
  }));

  const uniqueCategoryIds = Array.from(
    new Set(codLines.map((l) => l.categoryId).filter(Boolean))
  );
  const categoryList = await Promise.all(
    uniqueCategoryIds.map((id) => categoryRepo.findById(id))
  );
  const categoryById = new Map(
    categoryList.filter((c): c is NonNullable<typeof c> => Boolean(c)).map((c) => [c.id, c])
  );

  const quote = computeCodDepositForCart(codLines, categoryById, payablePaise);
  return NextResponse.json(quote);
}
