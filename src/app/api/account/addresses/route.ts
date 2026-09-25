import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { addressRepo } from "@/server/repositories";
import { INDIAN_STATES } from "@/features/checkout/checkout.schema";

const addressPayload = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().regex(/^(\+91[- ]?)?[6-9]\d{9}$/),
  line1: z.string().trim().min(4),
  line2: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  city: z.string().trim().min(2),
  state: z.enum(INDIAN_STATES),
  pincode: z.string().trim().regex(/^\d{6}$/),
  country: z.literal("India").optional(),
  isDefault: z.boolean().optional()
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const list = await addressRepo.listByUser(session.userId);
  return NextResponse.json({ addresses: list });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const raw = await req.json().catch(() => null);
  const parsed = addressPayload.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const created = await addressRepo.create(session.userId, {
    ...parsed.data,
    country: parsed.data.country ?? "India",
    isDefault: parsed.data.isDefault ?? false
  });
  return NextResponse.json({ address: created }, { status: 201 });
}
