import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { orderRepo, returnRepo } from "@/server/repositories";
import { RETURN_REASONS } from "@/types/return-request";

const RETURN_WINDOW_DAYS = Number(process.env.RETURN_WINDOW_DAYS ?? "7");

const bodySchema = z.object({
  reason: z.enum(RETURN_REASONS as unknown as [string, ...string[]]),
  note: z.string().trim().max(2000).optional().default("")
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const order = await orderRepo.findById(id);
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (order.status !== "delivered") {
    return NextResponse.json({ error: "not_delivered" }, { status: 409 });
  }
  const deliveredAt = new Date(order.updatedAt).getTime();
  const windowMs = RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - deliveredAt > windowMs) {
    return NextResponse.json({ error: "window_closed" }, { status: 409 });
  }

  const existing = await returnRepo.findByOrder(order.id);
  if (existing) return NextResponse.json({ error: "already_requested" }, { status: 409 });

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const created = await returnRepo.create({
    orderId: order.id,
    userId: session.userId,
    reason: parsed.data.reason,
    note: parsed.data.note ?? ""
  });
  await orderRepo.updateStatus(order.id, "return_requested");
  return NextResponse.json({ request: created });
}
