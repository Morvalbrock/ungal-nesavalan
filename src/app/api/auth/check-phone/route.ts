import { NextResponse } from "next/server";
import { userRepo } from "@/server/repositories";
import { normalizePhone } from "@/features/auth/otp.service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit-request";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(req, {
    bucket: "auth:check-phone",
    key: ip,
    max: 30,
    windowMs: 60_000
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const body = (await req.json().catch(() => null)) as { phone?: string } | null;
  const rawPhone = body?.phone?.trim();

  if (!rawPhone) {
    return NextResponse.json({ error: "phone_required", message: "Phone number is required" }, { status: 400 });
  }

  const normalized = normalizePhone(rawPhone);
  const user = await userRepo.findByPhone(normalized);

  return NextResponse.json({
    exists: Boolean(user),
    name: user?.name
  });
}
