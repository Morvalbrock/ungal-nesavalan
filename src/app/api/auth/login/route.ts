import { NextResponse } from "next/server";
import { loginSchema, AuthError } from "@/features/auth/auth.provider";
import { jwtAuthProvider } from "@/features/auth/jwt-auth.provider";
import { setSessionCookie } from "@/features/auth/session";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
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
