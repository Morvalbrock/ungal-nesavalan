import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { abandonedCartRepo, userRepo } from "@/server/repositories";
import type { CartItem } from "@/features/cart/cart.types";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: true, skipped: "unauthenticated" });

  const body = (await req.json().catch(() => null)) as { items?: CartItem[] } | null;
  const items = Array.isArray(body?.items) ? body!.items : [];
  if (items.length === 0) return NextResponse.json({ ok: true, skipped: "empty" });

  const user = await userRepo.findById(session.userId);
  if (!user) return NextResponse.json({ ok: true, skipped: "unauthenticated" });

  const subtotalPaise = items.reduce((n, i) => n + i.unitPricePaise * i.quantity, 0);
  const snapshot = await abandonedCartRepo.upsertForUser({
    userId: user.id,
    email: user.email,
    items,
    subtotalPaise
  });
  return NextResponse.json({ ok: true, snapshotId: snapshot.id });
}
