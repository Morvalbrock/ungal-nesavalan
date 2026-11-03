import { NextResponse } from "next/server";
import { sendOtpSchema } from "@/features/auth/auth.provider";
import { sendOtp, normalizePhone } from "@/features/auth/otp.service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit-request";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = sendOtpSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const phone = normalizePhone(parsed.data.phone);
  const ip = getClientIp(req);

  // Rate limit: max 5 OTP requests per phone per 10 minutes
  const rl = checkRateLimit(req, {
    bucket: "auth:send-otp",
    key: `${ip}:${phone}`,
    max: 5,
    windowMs: 10 * 60_000
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const result = await sendOtp(phone);

  if (!result.success) {
    return NextResponse.json(
      { error: "otp_failed", message: result.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: result.message });
}
