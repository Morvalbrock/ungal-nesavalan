import { NextResponse } from "next/server";
import { firebaseLoginSchema } from "@/features/auth/auth.provider";
import { verifyFirebaseIdToken } from "@/features/auth/firebase-verify";
import { loginWithFirebaseUser } from "@/features/auth/jwt-auth.provider";
import { setSessionCookie } from "@/features/auth/session";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit-request";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = firebaseLoginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);

  // Rate limit: max 10 Firebase login attempts per IP per 10 minutes
  const rl = checkRateLimit(req, {
    bucket: "auth:firebase-login",
    key: ip,
    max: 10,
    windowMs: 10 * 60_000
  });
  if (!rl.ok) return rateLimitResponse(rl);

  try {
    const verified = await verifyFirebaseIdToken(parsed.data.idToken);

    // Prefer the server-verified phone from the token; fall back to the one
    // the client sent so dev-mode (no Firebase) still works.
    const phone = verified.phone || parsed.data.phone;

    const { user, token, isNewUser } = await loginWithFirebaseUser({
      uid: verified.uid,
      email: verified.email,
      phone,
      name: verified.name
    });

    await setSessionCookie(token);
    return NextResponse.json({ success: true, isNewUser, user });
  } catch (err) {
    console.error("[firebase-login] verification error:", err);
    return NextResponse.json(
      { error: "invalid_token", message: err instanceof Error ? err.message : "Login failed" },
      { status: 401 }
    );
  }
}
