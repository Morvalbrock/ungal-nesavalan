import { NextResponse } from "next/server";
import { verifyOtpSchema } from "@/features/auth/auth.provider";
import { verifyOtp, normalizePhone } from "@/features/auth/otp.service";
import { loginWithPhone } from "@/features/auth/jwt-auth.provider";
import { setSessionCookie } from "@/features/auth/session";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit-request";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const phone = normalizePhone(parsed.data.phone);
  const ip = getClientIp(req);

  // Rate limit: max 5 verification attempts per phone per 10 minutes
  const rl = checkRateLimit(req, {
    bucket: "auth:verify-otp",
    key: `${ip}:${phone}`,
    max: 5,
    windowMs: 10 * 60_000
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const result = await verifyOtp(phone, parsed.data.otp);

  if (!result.success) {
    return NextResponse.json(
      { error: "otp_failed", message: result.message },
      { status: 401 }
    );
  }

  // OTP verified — login or auto-create the user
  try {
    const { user, token } = await loginWithPhone(phone);
    await setSessionCookie(token);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("[verify-otp] login error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
