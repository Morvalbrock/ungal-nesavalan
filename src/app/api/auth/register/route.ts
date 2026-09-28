import { NextResponse } from "next/server";
import { registerSchema, AuthError } from "@/features/auth/auth.provider";
import { jwtAuthProvider } from "@/features/auth/jwt-auth.provider";
import { setSessionCookie } from "@/features/auth/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit-request";

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: "auth:register",
    max: 1000,
    windowMs: 60_000
  });
  if (!rl.ok) return rateLimitResponse(rl);

  const raw = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  try {
    const { user, token } = await jwtAuthProvider.register(parsed.data);
    await setSessionCookie(token);
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
