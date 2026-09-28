import { NextResponse } from "next/server";
import { loginSchema, AuthError } from "@/features/auth/auth.provider";
import { jwtAuthProvider } from "@/features/auth/jwt-auth.provider";
import { setSessionCookie } from "@/features/auth/session";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit-request";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const emailKey = parsed.data.email.trim().toLowerCase();
  const ip = getClientIp(req);
  const rl = checkRateLimit(req, {
    bucket: "auth:login",
    key: `${ip}:${emailKey}`,
    max: 5,
    windowMs: 15 * 60_000
  });
  if (!rl.ok) return rateLimitResponse(rl);

  try {
    const { user, token } = await jwtAuthProvider.login(parsed.data);
    await setSessionCookie(token);
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
