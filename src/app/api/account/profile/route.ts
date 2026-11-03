import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { userRepo } from "@/server/repositories";
import { normalizePhone } from "@/features/auth/otp.service";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").optional().or(z.literal("").transform(() => undefined)),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("").transform(() => undefined)),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined))
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const raw = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const patch: { name?: string; email?: string; phone?: string } = {};

  if (parsed.data.name) {
    patch.name = parsed.data.name;
  }

  if (parsed.data.phone) {
    patch.phone = normalizePhone(parsed.data.phone);
  }

  if (parsed.data.email) {
    const normalizedEmail = parsed.data.email.toLowerCase();
    const existing = await userRepo.findByEmail(normalizedEmail);
    if (existing && existing.id !== session.userId) {
      return NextResponse.json(
        { error: "email_taken", message: "This email address is already linked to another account." },
        { status: 409 }
      );
    }
    patch.email = normalizedEmail;
  }

  if (Object.keys(patch).length === 0) {
    const current = await userRepo.findById(session.userId);
    if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const { passwordHash: _pw, ...pub } = current;
    void _pw;
    return NextResponse.json({ user: pub });
  }

  const updated = await userRepo.update(session.userId, patch);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { passwordHash: _pw, ...pub } = updated;
  void _pw;
  return NextResponse.json({ user: pub });
}

export async function POST(req: Request) {
  return PATCH(req);
}
