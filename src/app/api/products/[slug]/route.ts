import { NextResponse } from "next/server";
import { productRepo } from "@/server/repositories";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}
