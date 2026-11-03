import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import { abandonedCartRepo } from "@/server/repositories";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const cartId = url.searchParams.get("id");
  if (!cartId) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const carts = await abandonedCartRepo.listActive();
  const cart = carts.find((c) => c.id === cartId);
  if (!cart) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (cart.userId !== session.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ items: cart.items });
}
