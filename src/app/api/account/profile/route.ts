import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/features/auth/session";
import { userRepo } from "@/server/repositories";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number")
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
  const user = await userRepo.update(session.userId, parsed.data);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { passwordHash: _pw, ...pub } = user;
  void _pw;
  return NextResponse.json({ user: pub });
}
