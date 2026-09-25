import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { wishlistRepo } from "@/server/repositories";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { productIds?: string[] } | null;
  const ids = Array.isArray(body?.productIds) ? body!.productIds.filter((x) => typeof x === "string") : [];

  const items = await wishlistRepo.merge(session.userId, ids);
  return NextResponse.json({ count: items.length });
}
