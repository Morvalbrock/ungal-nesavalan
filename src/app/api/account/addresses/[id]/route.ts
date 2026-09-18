import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { addressRepo } from "@/server/repositories";
import { INDIAN_STATES } from "@/features/checkout/checkout.schema";

const patchSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phone: z.string().trim().regex(/^(\+91[- ]?)?[6-9]\d{9}$/).optional(),
  line1: z.string().trim().min(4).optional(),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2).optional(),
  state: z.enum(INDIAN_STATES).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/).optional(),
  isDefault: z.boolean().optional()
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const updated = await addressRepo.update(id, session.userId, parsed.data);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ address: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const removed = await addressRepo.remove(id, session.userId);
  if (!removed) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
