import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { productRepo, questionRepo, userRepo } from "@/server/repositories";

const bodySchema = z.object({
  body: z.string().trim().min(10).max(1000),
  authorName: z.string().trim().min(2).max(80).optional()
});

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const items = await questionRepo.listByProduct(product.id);
  return NextResponse.json({ items });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const session = await getSession();
  let authorName = parsed.data.authorName?.trim() || "Anonymous";
  let userId: string | null = null;
  if (session) {
    userId = session.userId;
    const user = await userRepo.findById(session.userId);
    if (user?.name) authorName = user.name;
  }

  const question = await questionRepo.create({
    productId: product.id,
    userId,
    authorName,
    body: parsed.data.body
  });

  return NextResponse.json({ question });
}
