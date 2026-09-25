import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { cartRepo } from "@/server/repositories";
import type { CartItem } from "@/features/cart/cart.types";

// GET returns the server-side cart for the current user (empty for guests).
// PUT replaces the server cart with the payload (used when the client mutates its store while logged in).
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [] });
  const cart = await cartRepo.get(session.userId);
  return NextResponse.json({ items: cart?.items ?? [] });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { items?: CartItem[] } | null;
  const items = Array.isArray(body?.items) ? body!.items : [];
  const saved = await cartRepo.save(session.userId, items);
  return NextResponse.json({ items: saved.items });
}
