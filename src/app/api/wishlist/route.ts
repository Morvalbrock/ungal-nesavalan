import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { productRepo, wishlistRepo } from "@/server/repositories";
import type { ProductSummary } from "@/types/product";

async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function GET() {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await wishlistRepo.listByUser(session.userId);
  const products = await Promise.all(rows.map((r) => productRepo.findById(r.productId)));
  const items = rows
    .map((r, i) => {
      const p = products[i];
      if (!p) return null;
      const summary: ProductSummary = {
        id: p.id,
        slug: p.slug,
        name: p.name,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        fabric: p.fabric,
        weave: p.weave,
        occasion: p.occasion,
        images: p.images,
        categoryId: p.categoryId,
        featured: p.featured
      };
      return { id: r.id, productId: r.productId, createdAt: r.createdAt, product: summary };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { productId?: string } | null;
  if (!body?.productId) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const product = await productRepo.findById(body.productId);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const row = await wishlistRepo.add(session.userId, body.productId);
  return NextResponse.json({ item: row });
}

export async function DELETE(req: Request) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { productId?: string } | null;
  if (!body?.productId) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const removed = await wishlistRepo.remove(session.userId, body.productId);
  return NextResponse.json({ removed });
}
