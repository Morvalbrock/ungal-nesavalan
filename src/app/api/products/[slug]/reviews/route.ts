import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { orderRepo, productRepo, reviewRepo, userRepo } from "@/server/repositories";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(10).max(2000)
});

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { searchParams } = new URL(_req.url);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const { items, total } = await reviewRepo.listByProduct(product.id, { page, perPage: 10 });
  const aggregate = await reviewRepo.aggregateFor(product.id);
  return NextResponse.json({ items, total, page, aggregate });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = await reviewRepo.findByUserAndProduct(session.userId, product.id);
  if (existing) return NextResponse.json({ error: "already_reviewed" }, { status: 409 });

  const eligibleOrder = await orderRepo.findEligibleForReview(session.userId, product.id);
  if (!eligibleOrder) return NextResponse.json({ error: "not_eligible" }, { status: 403 });

  const user = await userRepo.findById(session.userId);
  const review = await reviewRepo.create({
    productId: product.id,
    userId: session.userId,
    orderId: eligibleOrder.id,
    rating: parsed.data.rating as 1 | 2 | 3 | 4 | 5,
    title: parsed.data.title,
    body: parsed.data.body,
    authorName: user?.name ?? "Verified buyer"
  });

  return NextResponse.json({ review });
}
